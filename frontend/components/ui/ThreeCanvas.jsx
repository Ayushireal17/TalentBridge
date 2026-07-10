"use client";
import { useEffect, useRef } from "react";

export default function ThreeCanvas() {
  const mountRef = useRef(null);

  useEffect(() => {
    let THREE, scene, camera, renderer, particles, animId;

    const init = async () => {
      THREE = await import("three");
      if (!mountRef.current) return;

      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;

      scene  = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
      camera.position.z = 5;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      mountRef.current.appendChild(renderer.domElement);

      // Particle field
      const geo = new THREE.BufferGeometry();
      const count = 2000;
      const pos = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const c1 = new THREE.Color("#6c63ff");
      const c2 = new THREE.Color("#00d4aa");

      for (let i = 0; i < count * 3; i += 3) {
        pos[i]   = (Math.random() - 0.5) * 20;
        pos[i+1] = (Math.random() - 0.5) * 20;
        pos[i+2] = (Math.random() - 0.5) * 20;
        const mix = Math.random();
        colors[i]   = c1.r * (1 - mix) + c2.r * mix;
        colors[i+1] = c1.g * (1 - mix) + c2.g * mix;
        colors[i+2] = c1.b * (1 - mix) + c2.b * mix;
      }

      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color",    new THREE.BufferAttribute(colors, 3));

      const mat = new THREE.PointsMaterial({
        size: 0.04,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
      });

      particles = new THREE.Points(geo, mat);
      scene.add(particles);

      // Floating geometric shapes
      const shapes = [
        { geo: new THREE.IcosahedronGeometry(0.4, 0), pos: [2, 1, -2], color: "#6c63ff" },
        { geo: new THREE.OctahedronGeometry(0.3, 0),  pos: [-2, -1, -1], color: "#00d4aa" },
        { geo: new THREE.TetrahedronGeometry(0.3, 0), pos: [1, -2, -3], color: "#ff6b6b" },
      ];

      shapes.forEach(s => {
        const mesh = new THREE.Mesh(
          s.geo,
          new THREE.MeshBasicMaterial({ color: s.color, wireframe: true, opacity: 0.4, transparent: true })
        );
        mesh.position.set(...s.pos);
        mesh.userData = { speed: Math.random() * 0.01 + 0.005, phase: Math.random() * Math.PI * 2 };
        scene.add(mesh);
      });

      const clock = new THREE.Clock();

      const animate = () => {
        animId = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        particles.rotation.y = t * 0.05;
        particles.rotation.x = t * 0.02;

        scene.children.filter(c => c instanceof THREE.Mesh).forEach(m => {
          m.rotation.x += m.userData.speed;
          m.rotation.y += m.userData.speed * 0.7;
          m.position.y += Math.sin(t + m.userData.phase) * 0.002;
        });

        renderer.render(scene, camera);
      };
      animate();

      const onResize = () => {
        if (!mountRef.current) return;
        const w2 = mountRef.current.clientWidth;
        const h2 = mountRef.current.clientHeight;
        camera.aspect = w2 / h2;
        camera.updateProjectionMatrix();
        renderer.setSize(w2, h2);
      };
      window.addEventListener("resize", onResize);
    };

    init();

    return () => {
      cancelAnimationFrame(animId);
      if (renderer) renderer.dispose();
      if (mountRef.current && renderer?.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}
