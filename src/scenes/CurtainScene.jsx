"use client"
import { useEffect, useRef } from "react"
import * as THREE from "three"

export function WaveAnimation({
  width,
  height,
  pointSize = 1.5,
  waveSpeed = 2.0,
  waveIntensity = 8.0, 
  particleColor = "#ff0000", // Red color
  gridDistance = 5,
  className = "",
}) {
  const canvasRef = useRef(null)
  const rendererRef = useRef(null)
  const animationIdRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const container = canvasRef.current
    const w = width || container.clientWidth
    const h = height || container.clientHeight
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(window.devicePixelRatio)
    rendererRef.current = renderer
    container.appendChild(renderer.domElement)

    // Field of View, Aspect, Near, Far
    const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000)
    camera.position.z = 200 // Positioned to face the "wall"

    const scene = new THREE.Scene()
    const geo = new THREE.BufferGeometry()
    const positions = []

    // Grid dimensions for a vertical background wall
    const gridWidth = 800
    const gridHeight = 600

    for (let x = 0; x < gridWidth; x += gridDistance) {
      for (let y = 0; y < gridHeight; y += gridDistance) {
        positions.push(
          -gridWidth / 2 + x, 
          -gridHeight / 2 + y, 
          0 // Flat Z-plane
        )
      }
    }

    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0.0 },
        u_point_size: { value: pointSize },
        u_color: { value: new THREE.Color(particleColor) },
      },
      vertexShader: `
        #define M_PI 3.141592653589793238462
        precision mediump float;
        uniform float u_time;
        uniform float u_point_size;
        
        void main() {
          vec3 p = position;
          // Displacement on the Z axis creates the "background" wave depth
          float wave = sin(p.x * 0.02 + u_time * ${waveSpeed.toFixed(1)}) * ${waveIntensity.toFixed(1)};
          wave += cos(p.y * 0.02 + u_time * ${waveSpeed.toFixed(1)}) * ${waveIntensity.toFixed(1)};
          p.z += wave;

          gl_PointSize = u_point_size;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        precision mediump float;
        uniform vec3 u_color;
        void main() {
          gl_FragColor = vec4(u_color, 1.0);
        }
      `,
    })

    const mesh = new THREE.Points(geo, mat)
    scene.add(mesh)

    const clock = new THREE.Clock()
    function render() {
      mat.uniforms.u_time.value = clock.getElapsedTime()
      renderer.render(scene, camera)
      animationIdRef.current = requestAnimationFrame(render)
    }
    render()

    const handleResize = () => {
      const newW = width || container.clientWidth
      const newH = height || container.clientHeight
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
    }
  }, [width, height, pointSize, waveSpeed, waveIntensity, particleColor, gridDistance])

  return <div ref={canvasRef} className={className} style={{ width: "100%", height: "100%" }} />
}