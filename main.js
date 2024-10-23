import "./style.css"
import * as THREE from "three"
// import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { RGBELoader } from "three/addons/loaders/RGBELoader.js"
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js'
import gsap from "gsap"
import LocomotiveScroll from 'locomotive-scroll';

const locomotiveScroll = new LocomotiveScroll();

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 0, 3.5)

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("canvas"),
  antialias: true,
  alpha: true
})

renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 2.5
renderer.outputEncoding = THREE.sRGBEncoding
renderer.outputColorSpace = THREE.SRGBColorSpace

const pmremGenerator = new THREE.PMREMGenerator(renderer)
pmremGenerator.compileEquirectangularShader()

const composer = new EffectComposer(renderer)
const renderPass = new RenderPass(scene, camera)
composer.addPass(renderPass)

const rgbShiftPass = new ShaderPass(RGBShiftShader)
rgbShiftPass.uniforms['amount'].value = 0.0030
composer.addPass(rgbShiftPass)

let model;

new RGBELoader().load("https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr", (environment) => {
  const environmentMap = pmremGenerator.fromEquirectangular(environment).texture;
  // scene.background = environmentMap;
  scene.environment = environmentMap;
  environment.dispose()
  pmremGenerator.dispose()

  const modelLoader = new GLTFLoader()
  modelLoader.load("./DamagedHelmet.gltf", (gltf) => {
    model = gltf.scene
    scene.add(model)
  }, undefined, (error) => {
    console.log("Error: " + error)
  })
})

// const controls = new OrbitControls(camera, renderer.domElement)
// controls.enableDamping = true

window.addEventListener("mousemove", (e) => {
  // rgbShiftPass.uniforms['amount'].value = e.clientX / window.innerWidth
  // rgbShiftPass.uniforms['amount'].value = e.clientY / window.innerHeight
  if(model) {
    gsap.to(model.rotation, {
      y: gsap.utils.clamp(-Math.PI / 4, Math.PI / 4, (e.clientX / window.innerWidth - 0.5) * Math.PI),
      x: gsap.utils.clamp(-Math.PI / 4, Math.PI / 4, (e.clientY / window.innerHeight - 0.5) * Math.PI),
      duration: 3,
      ease: "power2.out"
    });
  }
})

window.addEventListener("resize", () => {
  const newWidth = window.innerWidth
  const newHeight = window.innerHeight
  
  renderer.setSize(newWidth, newHeight)
  composer.setSize(newWidth, newHeight)
  
  camera.aspect = newWidth / newHeight
  camera.updateProjectionMatrix()
})

function animate() {
  requestAnimationFrame(animate)
  composer.render()
  // controls.update()
}

animate()