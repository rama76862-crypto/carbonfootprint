import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 3000;
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);

    const colors = [
      new THREE.Color(0x0ea5e9), // Sky blue
      new THREE.Color(0x6366f1), // Indigo
      new THREE.Color(0x22c55e), // Green
    ];

    for (let i = 0; i < particlesCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 30;
      posArray[i + 1] = (Math.random() - 0.5) * 30;
      posArray[i + 2] = (Math.random() - 0.5) * 30;

      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      colorArray[i] = randomColor.r;
      colorArray[i + 1] = randomColor.g;
      colorArray[i + 2] = randomColor.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.025,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Create a central shape
    const torusGeometry = new THREE.TorusGeometry(2.5, 0.8, 16, 100);
    const torusMaterial = new THREE.MeshPhongMaterial({
      color: 0x0ea5e9,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
      shininess: 100,
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    scene.add(torus);

    const innerTorusGeometry = new THREE.TorusGeometry(1.5, 0.4, 16, 100);
    const innerTorusMaterial = new THREE.MeshPhongMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const innerTorus = new THREE.Mesh(innerTorusGeometry, innerTorusMaterial);
    scene.add(innerTorus);

    // Add lights
    const pointLight1 = new THREE.PointLight(0x0ea5e9, 2, 100);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x6366f1, 2, 100);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    camera.position.z = 10;

    // Mouse movement
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.001;

      // Rotate particles
      particlesMesh.rotation.x += 0.0008;
      particlesMesh.rotation.y += 0.0012;

      // Rotate toruses
      torus.rotation.x += 0.002;
      torus.rotation.y += 0.003;
      innerTorus.rotation.x -= 0.003;
      innerTorus.rotation.y += 0.002;

      // Animate particles vertically
      const positions = particlesGeometry.attributes.position.array;
      for (let i = 0; i < particlesCount * 3; i += 3) {
        positions[i + 1] += Math.sin(time + positions[i]) * 0.001;
      }
      particlesGeometry.attributes.position.needsUpdate = true;

      // Move camera based on mouse
      camera.position.x = mouseX * 1.5;
      camera.position.y = mouseY * 1.5;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      torusGeometry.dispose();
      torusMaterial.dispose();
      innerTorusGeometry.dispose();
      innerTorusMaterial.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
      }}
    />
  );
}
