"use client"
import { useEffect, useRef } from "react"
import * as THREE from "three"

export function WaveAnimation({
  width,
  height,
  pointSize = 1.5,
  waveSpeed = 0.5,      
  waveIntensity = 5.0,  
  particleColor = "#ff0000",
  gridDistance = 3, 
  className = "",
}) {
  const canvasRef = useRef(null)
  const rendererRef = useRef(null)
  const animationIdRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const container = canvasRef.current
    const w = width || container.clientWidth || window.innerWidth
    const h = height || container.clientHeight || window.innerHeight
    
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 2000)
    camera.position.set(0, 0, 400)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    rendererRef.current = renderer
    container.appendChild(renderer.domElement)

    const geo = new THREE.BufferGeometry()
    const positions = []
    const gridWidth = 1600 
    const gridHeight = 1000

    for (let x = -gridWidth / 2; x < gridWidth / 2; x += gridDistance) {
      for (let y = -gridHeight / 2; y < gridHeight / 2; y += gridDistance) {
        positions.push(x, y, 0)
      }
    }
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0.0 },
        u_point_size: { value: pointSize },
        u_intensity: { value: waveIntensity },
        u_color: { value: new THREE.Color(particleColor) },
      },
      vertexShader: `
        precision mediump float;
        uniform float u_time;
        uniform float u_point_size;
        uniform float u_intensity;
        
        void main() {
          vec3 p = position;
          
          // SPLIT LOGIC:
          // abs(p.x) makes the math symmetrical around the center Y-axis.
          // Subtracting u_time from the absolute X creates the outward flow.
          float centerX = abs(p.x);
          
          float wave = 0.0;
          
          // Layer 1: Main outward roll
          wave += sin(centerX * 0.01 - u_time * 2.0) * 2.0;
          
          // Layer 2: Medium ripples
          wave += sin(centerX * 0.03 - u_time * 3.5) * 1.0;
          
          // Layer 3: Vertical subtle movement for organic feel
          wave += cos(p.y * 0.01 + u_time * 0.5) * 0.5;

          // Apply displacement to Z
          p.z += wave * u_intensity;

          gl_PointSize = u_point_size;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        precision mediump float;
        uniform vec3 u_color;
        void main() {
          float dist = distance(gl_PointCoord, vec2(0.5));
          if (dist > 0.5) discard;
          
          // Slight glow effect: brighter center, softer edges
          float alpha = 0.7 * (1.0 - dist * 2.0);
          gl_FragColor = vec4(u_color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const mesh = new THREE.Points(geo, mat)
    scene.add(mesh)

    const clock = new THREE.Clock()
    const animate = () => {
      mat.uniforms.u_time.value = clock.getElapsedTime() * waveSpeed;
      renderer.render(scene, camera)
      animationIdRef.current = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      const newW = container.clientWidth || window.innerWidth
      const newH = container.clientHeight || window.innerHeight
      camera.aspect = newW / newH
      camera.updateProjectionMatrix()
      renderer.setSize(newW, newH)
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current)
      renderer.dispose()
      geo.dispose()
      mat.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [width, height, pointSize, waveSpeed, waveIntensity, particleColor, gridDistance])

  return <div ref={canvasRef} className={className} style={{ width: "100%", height: "100%" }} />
}