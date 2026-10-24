import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { Group, MeshStandardMaterial, Vector3, Quaternion, ACESFilmicToneMapping } from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { StructureStill } from './HeroStructure';

type Host = RefObject<HTMLDivElement | null>;
const modules = [
  { x: -2.1, y: -.72, z: .7, size: 1.65 },
  { x: 0, y: .05, z: 0, size: 2.05 },
  { x: 2.15, y: .9, z: -.7, size: 1.55 },
];
function Sculpture({ host }: { host: Host }) {
  const group = useRef<Group>(null);
  const { invalidate, camera, gl } = useThree();
  const active = useRef(true);
  const pointer = useRef({ x: 0, y: 0 });
  const animation = useRef({ entrance: 0, scroll: 0 });
  const geometry = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 2, .09), []);
  const materials = useMemo(() => ({
    metal: new MeshStandardMaterial({ color: '#788397', metalness: .94, roughness: .24 }),
    matte: new MeshStandardMaterial({ color: '#171c27', metalness: .55, roughness: .48 }),
    violet: new MeshStandardMaterial({ color: '#8575b8', metalness: .84, roughness: .25 }),
    blue: new MeshStandardMaterial({ color: '#526caa', metalness: .8, roughness: .3 }),
  }), []);
  const links = useMemo(() => modules.slice(0, -1).flatMap((a, i) => {
    const b = modules[i + 1];
    return [-1, 1].map(side => {
      const start = new Vector3(a.x + a.size / 2, a.y - a.size / 2 + .12, a.z + side * .32);
      const end = new Vector3(b.x - b.size / 2, b.y - b.size / 2 + .12, b.z + side * .32);
      const direction = end.clone().sub(start);
      return { center: start.clone().add(end).multiplyScalar(.5), length: direction.length(), quaternion: new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.normalize()) };
    });
  }), []);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const element = host.current;
    if (!element) return;
    const wake = () => { if (active.current && !document.hidden) invalidate(); };
    const context = gsap.context(() => {
      gsap.to(animation.current, { entrance: 1, duration: 1.15, ease: 'power3.out', onUpdate: wake });
      gsap.to(animation.current, { scroll: 1, ease: 'none', scrollTrigger: { trigger: element.closest('.landing-hero'), start: 'top top', end: 'bottom top', scrub: .45 }, onUpdate: wake });
    }, element);
    const move = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      pointer.current = { x: (event.clientX - rect.left) / rect.width - .5, y: (event.clientY - rect.top) / rect.height - .5 }; wake();
    };
    const leave = () => { pointer.current = { x: 0, y: 0 }; wake(); };
    const observer = new IntersectionObserver(([entry]) => { active.current = entry.isIntersecting; wake(); });
    observer.observe(element);
    element.addEventListener('pointermove', move); element.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', wake);
    return () => { context.revert(); observer.disconnect(); element.removeEventListener('pointermove', move); element.removeEventListener('pointerleave', leave); document.removeEventListener('visibilitychange', wake); };
  }, [host, invalidate]);
  useEffect(() => () => { geometry.dispose(); Object.values(materials).forEach(material => material.dispose()); }, [geometry, materials]);
  useFrame((_, delta) => {
    if (!group.current || !active.current || document.hidden) return;
    const { entrance, scroll } = animation.current;
    const targetY = -.32 + pointer.current.x * .32 + scroll * .6;
    const targetX = .2 + pointer.current.y * .18 - scroll * .16;
    const blend = 1 - Math.exp(-7 * Math.min(delta, .05));
    group.current.rotation.y += (targetY - group.current.rotation.y) * blend;
    group.current.rotation.x += (targetX - group.current.rotation.x) * blend;
    group.current.position.y = (1 - entrance) * -.6 - scroll * .3;
    group.current.scale.setScalar(.84 + entrance * .16);
    camera.position.z = 11.5 + scroll * 1.4;
    camera.position.x = scroll * .4;
    camera.lookAt(0, .12, 0);
    if (Math.abs(targetY - group.current.rotation.y) + Math.abs(targetX - group.current.rotation.x) > .0002) invalidate();
    gl.shadowMap.needsUpdate = true;
  });
  return <group ref={group} rotation={[.2, -.32, -.06]}>
    {modules.map((module, index) => <group key={index} position={[module.x, module.y, module.z]}>
      {[-1, 1].map(side => <group key={side}>
        <mesh geometry={geometry} material={index === 1 ? materials.metal : materials.matte} position={[side * module.size / 2, 0, 0]} scale={[.22, module.size + .22, .6]} castShadow receiveShadow/>
        <mesh geometry={geometry} material={materials.metal} position={[0, side * module.size / 2, 0]} scale={[module.size - .18, .22, .6]} castShadow receiveShadow/>
      </group>)}
      <mesh geometry={geometry} material={index === 0 ? materials.blue : materials.violet} position={[module.size / 2, 0, .325]} scale={[.045, module.size -.1, .035]}/>
      <mesh geometry={geometry} material={materials.matte} position={[0, -module.size / 2, 0]} scale={[module.size -.18, .12, .9]} castShadow receiveShadow/>
    </group>)}
    {links.map((link, index) => <mesh key={index} geometry={geometry} material={materials.metal} position={link.center} quaternion={link.quaternion} scale={[.1, link.length + .1, .1]} castShadow/>)}
  </group>;
}
export default function HeroScene({ host }: { host: Host }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <StructureStill/>;
  return <Canvas className="sculpture-canvas" frameloop="demand" dpr={[1, 1.5]} shadows camera={{ position: [0, .1, 11.5], fov: 39 }} gl={{ alpha: true, antialias: true, powerPreference: 'low-power', toneMapping: ACESFilmicToneMapping }} fallback={<StructureStill/>} onCreated={({ gl }) => {
    gl.toneMappingExposure = 1.15;
    gl.domElement.addEventListener('webglcontextlost', () => setFailed(true), { once: true });
  }}>
    <ambientLight intensity={.35}/>
    <directionalLight position={[2, 7, 6]} intensity={3} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} shadow-normalBias={.04}/>
    <directionalLight position={[-5, 2, 3]} color="#a78bfa" intensity={2}/>
    <directionalLight position={[5, -1, 1]} color="#6c8bff" intensity={1.2}/>
    <Environment resolution={128} frames={1}>
      <Lightformer intensity={3} position={[0, 5, 3]} scale={[8, 3, 1]} rotation={[Math.PI / 3, 0, 0]}/>
      <Lightformer intensity={2} position={[-5, 1, 2]} scale={[3, 7, 1]} rotation={[0, Math.PI / 3, 0]} color="#c8bded"/>
      <Lightformer intensity={2} position={[5, 0, 1]} scale={[2, 6, 1]} rotation={[0, -Math.PI / 3, 0]} color="#9bb6f5"/>
    </Environment>
    <Sculpture host={host}/>
    <mesh position={[0, -2.4, 0]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[30,30]}/><shadowMaterial transparent opacity={.22}/></mesh>
  </Canvas>;
}
