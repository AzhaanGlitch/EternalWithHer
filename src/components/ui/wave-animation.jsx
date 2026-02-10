"use client"
import { useEffect, useRef } from "react"
import * as THREE from "three"

export function WaveAnimation({
  width,
  height,
  waveSpeed = 0.10,
  waveIntensity = 5.0,
  curtainColor = "#7e1515", 
  gridDistance = 0.5,
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

    // Create a plane geometry for solid surface
    const gridWidth = 1600
    const gridHeight = 1000
    const segmentsX = Math.floor(gridWidth / gridDistance)
    const segmentsY = Math.floor(gridHeight / gridDistance)

    const geo = new THREE.PlaneGeometry(gridWidth, gridHeight, segmentsX, segmentsY)

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0.0 },
        u_intensity: { value: waveIntensity },
        u_color: { value: new THREE.Color(curtainColor) },
      },
      vertexShader: `
        precision mediump float;
        uniform float u_time;
        uniform float u_intensity;
        
        varying float vWave;
        varying vec3 vPosition;
        
        void main() {
          vec3 p = position;
          
          float centerX = abs(p.x);
          
          float wave = 0.0;
          
          // Layer 1: Main outward roll
          wave += sin(centerX * 0.01 - u_time * 1.0) * 2.0;
          
          // Layer 2: Medium ripples
          wave += sin(centerX * 0.03 - u_time * 1.75) * 1.0;
          
          // Layer 3: Vertical subtle movement
          wave += cos(p.y * 0.01 + u_time * 0.25) * 0.5;

          // Apply displacement to Z
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
        
        varying float vWave;
        varying vec3 vPosition;
        
        void main() {
          // Base dark red maroon color
          vec3 baseColor = u_color;
          
          // Create shadow effect based on wave depth
          // Normalize wave value to 0-1 range for shadow calculation
          float shadowIntensity = (vWave / u_intensity) * 0.5 + 0.5;
          
          // Darker shadows in wave valleys (lower values), lighter on peaks
          float shadow = smoothstep(0.3, 0.7, shadowIntensity);
          
          // Mix black shadow with base color
          vec3 shadowColor = mix(vec3(0.0, 0.0, 0.0), baseColor, shadow * 0.6 + 0.4);
          
          // Add subtle gradient for depth
          float depthFade = 1.0 - (vPosition.z / (u_intensity * 3.5)) * 0.3;
          depthFade = clamp(depthFade, 0.7, 1.0);
          
          vec3 finalColor = shadowColor * depthFade;
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      side: THREE.DoubleSide,
    })

    const mesh = new THREE.Mesh(geo, mat)
    scene.add(mesh)

    const clock = new THREE.Clock()
    const animate = () => {
      mat.uniforms.u_time.value = clock.getElapsedTime() * waveSpeed
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
  }, [width, height, waveSpeed, waveIntensity, curtainColor, gridDistance])

  return <div ref={canvasRef} className={className} style={{ width: "100%", height: "100%" }} />
}