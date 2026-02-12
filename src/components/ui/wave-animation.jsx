"use client"
import { useEffect, useRef } from "react"
import * as THREE from "three"
import Matter from "matter-js"
import { createRope, createRopeAnchor, createTassel } from "../../physics/rope"
import soundManager from "../../core/SoundManager.jsx"

export function WaveAnimation({
  width,
  height,
  waveSpeed = 1.5,
  waveIntensity = 45,
  curtainColor = "#7e1515",
  gridDistance = 5,
  className = "",
  onCurtainOpen,
}) {
  const containerRef = useRef(null)
  const ropeCanvasRef = useRef(null)
  const animationIdRef = useRef(null)
  const openProgress = useRef(0)
  const isOpeningRef = useRef(false)
  const hasTriggeredRef = useRef(false)

  useEffect(() => {
    const container = containerRef.current
    const ropeCanvas = ropeCanvasRef.current
    if (!container || !ropeCanvas) return

    const w = width || container.clientWidth || window.innerWidth
    const h = height || container.clientHeight || window.innerHeight

    // Register curtain sound (not ambient — so it doesn't conflict with scene ambient)
    soundManager.register('curtainOpening', '/assets/sounds/curtain_opening.mp3', { loop: true, volume: 0.4 })

    // Register curtain sound
    soundManager.register('curtainOpening', '/assets/sounds/curtain_opening.mp3', { loop: true, volume: 0.4 })

    // Strategy to play sound ASAP:
    // 1. Try immediately (works if user interacted before reload)
    // 2. Add global listener for any click/touch to start sound if blocked
    let curtainSoundStarted = false
    const startCurtainSound = () => {
      // Resume AudioContext first (critical for autoplay policy)
      soundManager.resumeContext()

      if (!curtainSoundStarted && !isOpeningRef.current) {
        soundManager.play('curtainOpening')
        curtainSoundStarted = true

        // Clean up listeners once started
        window.removeEventListener('click', startCurtainSound)
        window.removeEventListener('touchstart', startCurtainSound)
        window.removeEventListener('keydown', startCurtainSound)
      }
    }

    startCurtainSound()
    window.addEventListener('click', startCurtainSound)
    window.addEventListener('touchstart', startCurtainSound)
    window.addEventListener('keydown', startCurtainSound)

    // ════════════════════════════════════════════════════════
    //  THREE.JS — Curtain wave scene
    // ════════════════════════════════════════════════════════
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 2000)
    camera.position.set(0, 0, 400)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.domElement.style.position = "absolute"
    renderer.domElement.style.top = "0"
    renderer.domElement.style.left = "0"
    renderer.domElement.style.zIndex = "1"
    container.appendChild(renderer.domElement)

    // Create two curtain halves — wide enough to cover the full viewport
    const gridWidth = 1600
    const gridHeight = 1200
    const segmentsX = Math.floor(gridWidth / gridDistance)
    const segmentsY = Math.floor(gridHeight / gridDistance)

    const createCurtainMaterial = () =>
      new THREE.ShaderMaterial({
        uniforms: {
          u_time: { value: 0.0 },
          u_intensity: { value: waveIntensity },
          u_color: { value: new THREE.Color(curtainColor) },
          u_openProgress: { value: 0.0 },
        },
        vertexShader: `
          precision mediump float;
          uniform float u_time;
          uniform float u_intensity;
          uniform float u_openProgress;
          
          varying float vWave;
          varying vec3 vPosition;
          
          void main() {
            vec3 p = position;
            float centerX = abs(p.x);
            float wave = 0.0;
            
            wave += sin(centerX * 0.01 - u_time * 1.0) * 2.0;
            wave += sin(centerX * 0.03 - u_time * 1.75) * 1.0;
            wave += cos(p.y * 0.01 + u_time * 0.25) * 0.5;

            p.z += wave * u_intensity;
            
            vWave = wave;
            vPosition = p;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `,
        fragmentShader: `
          precision mediump float;
          uniform vec3 u_color;
          uniform float u_intensity;
          uniform float u_openProgress;
          
          varying float vWave;
          varying vec3 vPosition;
          
          void main() {
            vec3 baseColor = u_color;
            float shadowIntensity = (vWave / u_intensity) * 0.5 + 0.5;
            float shadow = smoothstep(0.3, 0.7, shadowIntensity);
            vec3 shadowColor = mix(vec3(0.0, 0.0, 0.0), baseColor, shadow * 0.6 + 0.4);
            
            float depthFade = 1.0 - (vPosition.z / (u_intensity * 3.5)) * 0.3;
            depthFade = clamp(depthFade, 0.7, 1.0);
            
            vec3 finalColor = shadowColor * depthFade;
            float alpha = 1.0 - (u_openProgress * 0.3);
            
            gl_FragColor = vec4(finalColor, alpha);
          }
        `,
        side: THREE.DoubleSide,
        transparent: true,
      })

    // Left curtain
    const leftGeo = new THREE.PlaneGeometry(gridWidth, gridHeight, segmentsX, segmentsY)
    const leftMat = createCurtainMaterial()
    const leftMesh = new THREE.Mesh(leftGeo, leftMat)
    leftMesh.position.x = 0
    scene.add(leftMesh)

    // Right curtain
    const rightGeo = new THREE.PlaneGeometry(gridWidth, gridHeight, segmentsX, segmentsY)
    const rightMat = createCurtainMaterial()
    const rightMesh = new THREE.Mesh(rightGeo, rightMat)
    rightMesh.position.x = 0
    scene.add(rightMesh)

    // ════════════════════════════════════════════════════════
    //  MATTER.JS — Physics-based rope
    // ════════════════════════════════════════════════════════
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0.8, scale: 0.001 },  // Lighter gravity for calmer motion
    })

    const ropeAnchorX = w / 2
    const ropeAnchorY = 0  // Very top of the page

    const segmentLength = 26
    const ropeSegments = 14  // Longer rope
    const ropeWidth = 7

    // Create rope using the physics module
    const { rope, bodies, endBody, firstBody } = createRope({
      x: ropeAnchorX,
      y: ropeAnchorY,
      segments: ropeSegments,
      segmentLength,
      stiffness: 0.95,
      damping: 0.15,      // Higher damping = less oscillation
      ropeWidth,
    })

    // Override physics properties for calmer rope movement
    bodies.forEach((body) => {
      body.frictionAir = 0.08   // Much more air resistance (was 0.01)
      body.restitution = 0.01   // Almost no bounce
    })

    // Create anchor at the very top
    const anchor = createRopeAnchor({
      x: ropeAnchorX,
      y: ropeAnchorY,
      ropeFirstBody: firstBody,
      segmentLength,
    })

    // Create tassel
    const group = Matter.Body.nextGroup(true)
    const { tassel, constraint: tasselConstraint } = createTassel({
      ropeEndBody: endBody,
      segmentLength,
      radius: 16,
      group,
    })

    // Make tassel calmer too
    tassel.frictionAir = 0.06
    tassel.restitution = 0.01

    const tasselInitialY = tassel.position.y

    // Add to world
    Matter.Composite.add(engine.world, [rope, anchor, tassel, tasselConstraint])

    // Mouse interaction
    const mouse = Matter.Mouse.create(ropeCanvas)
    mouse.pixelRatio = window.devicePixelRatio || 1

    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.4,
        damping: 0.2,
        render: { visible: false },
      },
    })
    Matter.Composite.add(engine.world, mouseConstraint)

    // Start physics
    const runner = Matter.Runner.create()
    Matter.Runner.run(runner, engine)

    // ════════════════════════════════════════════════════════
    //  Setup rope 2D canvas
    // ════════════════════════════════════════════════════════
    const dpr = window.devicePixelRatio || 1
    ropeCanvas.width = w * dpr
    ropeCanvas.height = h * dpr
    ropeCanvas.style.width = w + "px"
    ropeCanvas.style.height = h + "px"
    const ropeCtx = ropeCanvas.getContext("2d")
    ropeCtx.scale(dpr, dpr)

    // ════════════════════════════════════════════════════════
    //  RENDER LOOP
    // ════════════════════════════════════════════════════════
    const clock = new THREE.Clock()
    const pullThreshold = 150  // Slightly more pull needed for longer rope

    const animate = () => {
      const time = clock.getElapsedTime() * waveSpeed
      leftMat.uniforms.u_time.value = time
      rightMat.uniforms.u_time.value = time

      // ── Check pull distance ──
      if (!isOpeningRef.current && !hasTriggeredRef.current) {
        const pullDistance = tassel.position.y - tasselInitialY
        if (pullDistance > pullThreshold) {
          isOpeningRef.current = true
          hasTriggeredRef.current = true
          // Stop curtain sound
          soundManager.stop('curtainOpening')
          Matter.Composite.remove(engine.world, mouseConstraint)
          startCurtainOpen()
        }
      }

      // ── Move curtains apart ──
      if (openProgress.current > 0) {
        const separation = openProgress.current * 900
        leftMesh.position.x = -separation
        rightMesh.position.x = separation
        leftMat.uniforms.u_openProgress.value = openProgress.current
        rightMat.uniforms.u_openProgress.value = openProgress.current
      }

      // ── Render Three.js scene ──
      renderer.render(scene, camera)

      // ── Render rope on 2D canvas ──
      ropeCtx.clearRect(0, 0, w, h)
      const ropeAlpha = Math.max(0, 1 - openProgress.current * 1.5)
      if (ropeAlpha > 0) {
        ropeCtx.globalAlpha = ropeAlpha
        drawRope(ropeCtx, bodies, tassel, ropeWidth)
        ropeCtx.globalAlpha = 1
      }

      animationIdRef.current = requestAnimationFrame(animate)
    }

    const startCurtainOpen = () => {
      const startProg = openProgress.current
      const startTime = Date.now()
      const duration = 1800

      const step = () => {
        const elapsed = Date.now() - startTime
        const t = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - t, 3)
        openProgress.current = startProg + (1 - startProg) * eased

        if (t < 1) {
          requestAnimationFrame(step)
        } else if (onCurtainOpen) {
          setTimeout(() => onCurtainOpen(), 300)
        }
      }
      step()
    }

    animate()

    // ── Resize ──
    const handleResize = () => {
      const nw = container.clientWidth || window.innerWidth
      const nh = container.clientHeight || window.innerHeight
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)

      const d = window.devicePixelRatio || 1
      ropeCanvas.width = nw * d
      ropeCanvas.height = nh * d
      ropeCanvas.style.width = nw + "px"
      ropeCanvas.style.height = nh + "px"
      ropeCtx.setTransform(d, 0, 0, d, 0, 0)
    }
    window.addEventListener("resize", handleResize)

    // ── Cleanup ──
    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("click", startCurtainSound)
      window.removeEventListener("touchstart", startCurtainSound)
      window.removeEventListener("keydown", startCurtainSound)

      // Stop sound on unmount (safety net)
      soundManager.stop('curtainOpening')

      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current)
      Matter.Runner.stop(runner)
      Matter.Engine.clear(engine)
      renderer.dispose()
      leftGeo.dispose()
      rightGeo.dispose()
      leftMat.dispose()
      rightMat.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [width, height, waveSpeed, waveIntensity, curtainColor, gridDistance, onCurtainOpen])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    >
      <canvas
        ref={ropeCanvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 2,
          cursor: "grab",
        }}
      />
    </div>
  )
}

// ════════════════════════════════════════════════════════
//  Rope drawing — realistic braided cord
// ════════════════════════════════════════════════════════
function drawRope(ctx, bodies, tassel, ropeWidth) {
  if (!bodies || bodies.length === 0) return

  const points = bodies.map((b) => ({ x: b.position.x, y: b.position.y }))

  // Helper to draw a smooth path through the points
  const tracePath = () => {
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length - 1; i++) {
      const mx = (points[i].x + points[i + 1].x) / 2
      const my = (points[i].y + points[i + 1].y) / 2
      ctx.quadraticCurveTo(points[i].x, points[i].y, mx, my)
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y)
  }

  // ── Layer 1: Deep shadow ──
  ctx.save()
  ctx.beginPath()
  tracePath()
  ctx.strokeStyle = "#1A0C04"
  ctx.lineWidth = ropeWidth + 5
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  ctx.stroke()
  ctx.restore()

  // ── Layer 2: Main cord body (dark warm brown) ──
  ctx.save()
  ctx.beginPath()
  tracePath()
  ctx.strokeStyle = "#5C3317"
  ctx.lineWidth = ropeWidth + 3
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  ctx.stroke()
  ctx.restore()

  // ── Layer 3: Mid tone (warm sienna) ──
  ctx.save()
  ctx.beginPath()
  tracePath()
  ctx.strokeStyle = "#7B4B2A"
  ctx.lineWidth = ropeWidth + 1
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  ctx.stroke()
  ctx.restore()

  // ── Layer 4: Highlight / braid center ──
  ctx.save()
  ctx.beginPath()
  tracePath()
  ctx.strokeStyle = "#A67C52"
  ctx.lineWidth = Math.max(ropeWidth - 3, 2)
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  ctx.stroke()
  ctx.restore()

  // ── Braid texture: alternating knots ──
  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    // Darker knot ring
    ctx.beginPath()
    ctx.arc(p.x, p.y, ropeWidth / 2 + 2, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(60, 30, 10, 0.25)"
    ctx.fill()
    // Lighter inner
    ctx.beginPath()
    ctx.arc(p.x + 0.5, p.y - 0.5, ropeWidth / 2 - 1, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(180, 130, 80, 0.15)"
    ctx.fill()
  }

  // ── Tassel — muted antique brass ──
  if (tassel) {
    const tx = tassel.position.x
    const ty = tassel.position.y
    const r = 16

    // Soft glow
    const glow = ctx.createRadialGradient(tx, ty, r * 0.2, tx, ty, r * 2)
    glow.addColorStop(0, "rgba(180, 140, 60, 0.18)")
    glow.addColorStop(1, "rgba(180, 140, 60, 0)")
    ctx.beginPath()
    ctx.arc(tx, ty, r * 2, 0, Math.PI * 2)
    ctx.fillStyle = glow
    ctx.fill()

    // Tassel body — antique brass gradient
    const grad = ctx.createRadialGradient(tx - 3, ty - 3, 1, tx, ty, r)
    grad.addColorStop(0, "#CDAA6D")
    grad.addColorStop(0.4, "#A07840")
    grad.addColorStop(0.8, "#7A5A2E")
    grad.addColorStop(1, "#4E3620")
    ctx.beginPath()
    ctx.arc(tx, ty, r, 0, Math.PI * 2)
    ctx.fillStyle = grad
    ctx.fill()

    // Subtle highlight
    ctx.beginPath()
    ctx.arc(tx - 4, ty - 4, r * 0.3, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(255, 240, 200, 0.3)"
    ctx.fill()

    // Dark ring border
    ctx.beginPath()
    ctx.arc(tx, ty, r, 0, Math.PI * 2)
    ctx.strokeStyle = "#3D2410"
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Threads hanging down
    const now = Date.now()
    for (let i = -3; i <= 3; i++) {
      const dx = tx + i * 3.5
      const len = 14 + Math.abs(i) * 2.5
      ctx.beginPath()
      ctx.moveTo(dx, ty + r - 2)
      ctx.quadraticCurveTo(
        dx + Math.sin(now * 0.002 + i) * 2,
        ty + r + len * 0.5,
        dx,
        ty + r + len
      )
      ctx.strokeStyle = i % 2 === 0 ? "#7A5A2E" : "#A07840"
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }

  // ── Anchor mount (small dark bracket) ──
  const ap = points[0]
  ctx.beginPath()
  ctx.arc(ap.x, ap.y - 6, 8, Math.PI, 0)
  ctx.strokeStyle = "#5C3317"
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(ap.x, ap.y - 6, 3.5, 0, Math.PI * 2)
  ctx.fillStyle = "#7B4B2A"
  ctx.fill()
}