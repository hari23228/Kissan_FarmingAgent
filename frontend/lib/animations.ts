// Animation variants for Framer Motion - Reusable across components

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
}

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4 }
}

export const slideInLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 },
  transition: { duration: 0.3 }
}

export const slideInRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
  transition: { duration: 0.3 }
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { type: "spring", stiffness: 300, damping: 25 }
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}

// Interaction variants
export const hoverScale = {
  scale: 1.05,
  transition: { type: "spring", stiffness: 400, damping: 10 }
}

export const tapScale = {
  scale: 0.95
}

export const pulseAnimation = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1]
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }
}

export const rotateIcon = {
  animate: {
    rotate: [0, 5, -5, 0]
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    repeatDelay: 3
  }
}

// Page transition variants
export const pageTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.3 }
}

// Card animations
export const cardHover = {
  scale: 1.02,
  y: -4,
  transition: { type: "spring", stiffness: 300, damping: 20 }
}

// Loading animations
export const spinAnimation = {
  animate: {
    rotate: 360
  },
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: "linear"
  }
}

export const dotAnimation = {
  animate: {
    y: [0, -10, 0]
  },
  transition: {
    duration: 0.6,
    repeat: Infinity,
    ease: "easeInOut"
  }
}

// Glow effect
export const glowEffect = {
  animate: {
    boxShadow: [
      "0 0 20px rgba(45, 106, 79, 0.3)",
      "0 0 40px rgba(45, 106, 79, 0.6)",
      "0 0 20px rgba(45, 106, 79, 0.3)"
    ]
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }
}
