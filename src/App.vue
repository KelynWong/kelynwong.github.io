<template>
  <div class="flex flex-col h-screen">
    <!-- Navbar (Top) -->
    <header
      class="bg-bg text-text py-3 px-6 flex items-center justify-between border-b-2 border-accent1 sticky top-0 z-50"
    >
      <!-- Logo Section -->
      <div class="flex items-center">
        <img src="./assets/images/logo.png" alt="Logo" class="h-8 mr-2" />
      </div>

      <!-- Navigation Section -->
      <nav>
        <ul class="hidden lg:flex space-x-4">
          <li class="h-7 w-px bg-accent1"></li>
          <li>
            <a href="#about" class="hover:text-code2 text-accent3 text-h5 transition-colors">_About Me</a>
          </li>
          <li class="h-7 w-px bg-accent1"></li>
          <li>
            <a href="#work" class="hover:text-code2 text-accent3 text-h5 transition-colors">_Work Exp</a>
          </li>
          <li class="h-7 w-px bg-accent1"></li>
          <li>
            <a href="#education" class="hover:text-code2 text-accent3 text-h5 transition-colors">_My Edu</a>
          </li>
          <li class="h-7 w-px bg-accent1"></li>
          <li>
            <a href="#projects" class="hover:text-code2 text-accent3 text-h5 transition-colors">_Projects</a>
          </li>
          <li class="h-7 w-px bg-accent1"></li>
          <li>
            <a href="#interests" class="hover:text-code2 text-accent3 text-h5 transition-colors">_Interests</a>
          </li>
          <li class="h-7 w-px bg-accent1"></li>
          <li>
            <a href="#contact" class="hover:text-code2 text-accent3 text-h5 transition-colors">_Contact Me</a>
          </li>
        </ul>

        <!-- Mobile Menu Button -->
        <button
          class="lg:hidden text-accent3 focus:outline-none"
          @click="toggleMobileMenu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>

        <!-- Mobile Menu -->
        <ul
          v-if="mobileMenuOpen"
          class="absolute top-0 left-0 w-full bg-bg text-text z-50 py-4 space-y-4 flex flex-col items-center lg:hidden"
        >
          <li><a href="#about" class="hover:text-code2 text-accent3 text-h5 transition-colors">_About Me</a></li>
          <li><a href="#work" class="hover:text-code2 text-accent3 text-h5 transition-colors">_Work Exp</a></li>
          <li><a href="#education" class="hover:text-code2 text-accent3 text-h5 transition-colors">_My Edu</a></li>
          <li><a href="#projects" class="hover:text-code2 text-accent3 text-h5 transition-colors">_Projects</a></li>
          <li><a href="#interests" class="hover:text-code2 text-accent3 text-h5 transition-colors">_Interests</a></li>
          <li><a href="#contact" class="hover:text-code2 text-accent3 text-h5 transition-colors">_Contact Me</a></li>
        </ul>
      </nav>
    </header>

    <!-- Header Section -->
    <div class="flex flex-1 flex-col lg:flex-row">
      <!-- Left Section -->
      <div class="bg-bg text-text p-12 flex-[0.8] flex flex-col items-start relative">
        <h2 class="text-h4 text-code1">
          <span ref="introText" class="type-text"></span><span class="cursor"></span>
        </h2>
        <h1 class="text-h0 text-text font-medium mb-5" ref="nameText">Kelyn Wong</h1>
        <h2 class="text-h4 text-code1">
          <span ref="introText2" class="type-text"></span><span class="cursor"></span>
        </h2>
        <h1 class="text-h0 text-code5 font-medium mb-5" ref="softwareEngineerText">Software Engineer</h1>
        <h2 class="text-h4 text-code1">
          <span ref="introText3" class="type-text"></span><span class="cursor"></span>
        </h2>

        <div class="relative">
          <div class="flex flex-wrap items-center gap-x-2 gap-y-1 mb-5">
            <div class="text-h2 text-code2">Collaborate.</div>
            <div class="text-h2 text-code3">Analyze.</div>
            <div class="text-h2 text-code4">Research.</div>
            <div class="text-h2 text-code5">Design.</div>
            <div class="text-h2 text-code2">Prototype.</div>
            <div class="text-h2 text-code3">Develop.</div>
            <div class="text-h2 text-code4">Code.</div>
            <div class="text-h2 text-code5">Document.</div>
            <div class="text-h2 text-code2">Test.</div>
            <div class="text-h2 text-code3">Refactor.</div>
            <div class="text-h2 text-code4">Debug.</div>
            <div class="text-h2 text-code5">Maintain.</div>
            <div class="text-h2 text-code2">Optimize.</div>
            <div class="text-h2 text-code3">Automate.</div>
          </div>

          <!-- Positioned Image -->
          <div class="absolute top-[50%] left-[40%] transform -translate-x-1/2 -translate-y-1/2">
            <img
              class="w-40 sm:w-46 md:w-54 lg:w-60 xl:w-64 opacity-95 z-10"
              src="./assets/images/computer.png"
              alt="Computer"
            />
          </div>

          <!-- Glow Effect -->
          <div class="absolute top-[50%] left-[40%] transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/20 rounded-full blur-2xl z-1"></div>
        </div>
      </div>

      <!-- Right Section (3D Model) -->
      <div class="flex-[1.2] relative lg:mt-0 mt-5">
        <div class="absolute top-0 left-0 w-full h-full">
          <ThreeJSModel />
        </div>
      </div>
    </div>

    <!-- Mouse Icon -->
    <div class="mouse">
      <div class="scroll"></div>
    </div>

    <aside class="bg-black text-white p-6 rounded-lg w-full max-w-lg font-mono">
      <div class="flex justify-between items-center">
        <div class="flex space-x-2 text-red-500">
          <div class="w-3 h-3 rounded-full bg-red-500"></div>
          <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div class="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <p class="text-sm">bash</p>
      </div>
      <div class="mt-4">
        <p class="text-green-400">$ npm install next</p>
        <p class="text-white">+ next@10.2.3</p>
        <p class="text-white">added 1 package, and audited 2 packages in 3s</p>
        <p class="text-green-400">$</p>
      </div>
    </aside>


    <!-- Main Sections -->
    <div id="about" class="flex justify-center h-screen bg-bg">
      <h1 class="text-h1 text-code3 font-bold" ref="aboutTitle">_About Me</h1>
    </div>

    <div id="work" class="flex justify-center h-screen bg-bg-alt">
      <h1 class="text-h1 text-code4 font-bold" ref="workTitle">_Work Experiences</h1>
    </div>

    <div id="education" class="flex justify-center h-screen bg-bg">
      <h1 class="text-h1 text-code5 font-bold">_My Education</h1>
    </div>

    <div id="projects" class="flex justify-center h-screen bg-bg-alt">
      <h1 class="text-h1 text-code2 font-bold">_Project Showcase</h1>
    </div>

    <div id="interests" class="flex justify-center h-screen bg-bg">
      <h1 class="text-h1 text-code3 font-bold">_Other Interests</h1>
    </div>

    <div id="contact" class="flex justify-center h-screen bg-bg-alt">
      <h1 class="text-h1 text-code4 font-bold">_Contact Me</h1>
    </div>
  </div>
</template>

<script>
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import ThreeJSModel from "./components/ThreeJSModel.vue";

gsap.registerPlugin(TextPlugin);
gsap.registerPlugin(ScrollTrigger);

export default {
  name: "App",
  components: {
    ThreeJSModel,
  },
  data() {
    return {
      mobileMenuOpen: false,
    };
  },
  mounted() {
    // Typing animation for introText
    gsap.to(this.$refs.introText, {
      text: "Hello there! My name is", // The text to type out
      duration: 2, // Duration for the typing effect
      ease: "power2.out", // Easing function
      delay: 0.5, // Delay before the typing starts
      onStart: () => this.blinkCursor(this.$refs.introText1),
    });

    // Fade-in animation for nameText
    gsap.from(this.$refs.nameText, {
      opacity: 0,
      y: 0,
      delay: 2, // Start after typing finishes
      duration: 1,
      ease: "power2.out",
    });

    gsap.to(this.$refs.introText2, {
      text: "I am a", // The text to type out
      duration: 1, // Duration for the typing effect
      ease: "power2.out", // Easing function
      delay: 2.5, // Delay before the typing starts
      onStart: () => this.blinkCursor(this.$refs.introText2),
    });

    gsap.from(this.$refs.softwareEngineerText, {
      opacity: 0,
      y: 0,
      delay: 3.5, // Start after typing finishes
      duration: 1,
      ease: "power2.out",
    });

    gsap.to(this.$refs.introText3, {
      text: "I...", // The text to type out
      duration: 1, // Duration for the typing effect
      ease: "power2.out", // Easing function
      delay: 4, // Delay before the typing starts
      onStart: () => this.blinkCursor(this.$refs.introText3),
    });

    // Scroll-triggered animations
    gsap.from(this.$refs.aboutTitle, {
      scrollTrigger: {
        trigger: this.$refs.aboutTitle,
        start: "top 80%", // Trigger animation when the element enters 80% of the viewport
        toggleActions: "play none none none",
      },
      opacity: 0,
      y: 50,
      duration: 1,
      ease: "power2.out",
    });

    gsap.from(this.$refs.workTitle, {
      scrollTrigger: {
        trigger: this.$refs.workTitle,
        start: "top 80%",
        toggleActions: "play none none none",
      },
      opacity: 0,
      y: 50,
      duration: 1,
      ease: "power2.out",
    });
  },
  methods: {
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen;
    },
    blinkCursor(element) {
      const cursor = element.querySelector('.cursor');
      gsap.to(cursor, {
        opacity: 0,
        repeat: -1,
        yoyo: true,
        duration: 0.5,
        ease: "linear",
      });
    },
  },
};
</script>

<style scoped>
</style>
