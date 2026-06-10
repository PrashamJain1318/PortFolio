const pickExport = (module, exportName) => {
    return module[exportName] || module.default?.[exportName] || module.default;
};

const gsapModule = await import('gsap/dist/gsap');
const reactModule = await import('@gsap/react');
const customEaseModule = await import('gsap/dist/CustomEase');
const customBounceModule = await import('gsap/dist/CustomBounce');
const customWiggleModule = await import('gsap/dist/CustomWiggle');
const easePackModule = await import('gsap/dist/EasePack');
const draggableModule = await import('gsap/dist/Draggable');
const drawSvgModule = await import('gsap/dist/DrawSVGPlugin');
const easelModule = await import('gsap/dist/EaselPlugin');
const flipModule = await import('gsap/dist/Flip');
const gsDevToolsModule = await import('gsap/dist/GSDevTools');
const inertiaModule = await import('gsap/dist/InertiaPlugin');
const motionPathHelperModule = await import('gsap/dist/MotionPathHelper');
const motionPathModule = await import('gsap/dist/MotionPathPlugin');
const morphSvgModule = await import('gsap/dist/MorphSVGPlugin');
const observerModule = await import('gsap/dist/Observer');
const physics2DModule = await import('gsap/dist/Physics2DPlugin');
const physicsPropsModule = await import('gsap/dist/PhysicsPropsPlugin');
const pixiModule = await import('gsap/dist/PixiPlugin');
const scrambleTextModule = await import('gsap/dist/ScrambleTextPlugin');
const scrollTriggerModule = await import('gsap/dist/ScrollTrigger');
const scrollSmootherModule = await import('gsap/dist/ScrollSmoother');
const scrollToModule = await import('gsap/dist/ScrollToPlugin');
const splitTextModule = await import('gsap/dist/SplitText');
const textModule = await import('gsap/dist/TextPlugin');

const gsap = pickExport(gsapModule, 'gsap');
const plugins = [
    pickExport(reactModule, 'useGSAP'),
    pickExport(draggableModule, 'Draggable'),
    pickExport(drawSvgModule, 'DrawSVGPlugin'),
    pickExport(easelModule, 'EaselPlugin'),
    pickExport(flipModule, 'Flip'),
    pickExport(gsDevToolsModule, 'GSDevTools'),
    pickExport(inertiaModule, 'InertiaPlugin'),
    pickExport(motionPathHelperModule, 'MotionPathHelper'),
    pickExport(motionPathModule, 'MotionPathPlugin'),
    pickExport(morphSvgModule, 'MorphSVGPlugin'),
    pickExport(observerModule, 'Observer'),
    pickExport(physics2DModule, 'Physics2DPlugin'),
    pickExport(physicsPropsModule, 'PhysicsPropsPlugin'),
    pickExport(pixiModule, 'PixiPlugin'),
    pickExport(scrambleTextModule, 'ScrambleTextPlugin'),
    pickExport(scrollTriggerModule, 'ScrollTrigger'),
    pickExport(scrollSmootherModule, 'ScrollSmoother'),
    pickExport(scrollToModule, 'ScrollToPlugin'),
    pickExport(splitTextModule, 'SplitText'),
    pickExport(textModule, 'TextPlugin'),
    pickExport(easePackModule, 'RoughEase'),
    pickExport(easePackModule, 'ExpoScaleEase'),
    pickExport(easePackModule, 'SlowMo'),
    pickExport(customEaseModule, 'CustomEase'),
    pickExport(customBounceModule, 'CustomBounce'),
    pickExport(customWiggleModule, 'CustomWiggle')
].filter(Boolean);

gsap.registerPlugin(...plugins);

console.log(`GSAP registered ${plugins.length} plugins successfully.`);
