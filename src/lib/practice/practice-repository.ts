import type {
  ChallengeItem,
  Difficulty,
  PracticeItem,
  PracticeKind,
  ProjectItem,
  QuizItem,
} from "@/types/domain";

const quizzes: QuizItem[] = [
  {
    slug: "linear-algebra-basics",
    kind: "quiz",
    title: "Linear Algebra Basics",
    summary: "Vectors, matrices, span, and basis — quick retrieval check.",
    topicSlugs: ["linear-algebra-robotics", "matrix-vector-operations"],
    difficulty: "beginner",
    estimatedMinutes: 10,
    questionCount: 8,
  },
  {
    slug: "least-squares-derivation",
    kind: "quiz",
    title: "Least Squares Derivation",
    summary: "Walk through the normal equations and where they break down.",
    topicSlugs: ["least-squares", "linear-algebra-robotics"],
    difficulty: "intermediate",
    estimatedMinutes: 15,
    questionCount: 6,
  },
  {
    slug: "calculus-foundations",
    kind: "quiz",
    title: "Calculus Foundations",
    summary: "Limits, derivatives, integrals — quick concept check.",
    topicSlugs: ["calculus-robotics", "limits-integration"],
    difficulty: "beginner",
    estimatedMinutes: 12,
    questionCount: 10,
  },
  {
    slug: "ode-modeling",
    kind: "quiz",
    title: "Modeling with ODEs",
    summary: "Translating physical systems into differential equations.",
    topicSlugs: ["ordinary-differential-equations", "calculus-robotics"],
    difficulty: "intermediate",
    estimatedMinutes: 15,
    questionCount: 7,
  },
  {
    slug: "graph-search-tradeoffs",
    kind: "quiz",
    title: "Graph Search Tradeoffs",
    summary: "When to choose BFS vs Dijkstra vs A*.",
    topicSlugs: ["search-algorithms", "intro-ai-programming"],
    difficulty: "intermediate",
    estimatedMinutes: 12,
    questionCount: 8,
  },
  {
    slug: "cpp-memory-model",
    kind: "quiz",
    title: "C++ Memory Model",
    summary: "Stack vs heap, RAII, and object lifetimes.",
    topicSlugs: ["cpp-fundamentals", "intro-ai-programming"],
    difficulty: "intermediate",
    estimatedMinutes: 12,
    questionCount: 8,
  },
  {
    slug: "pointers-and-leaks",
    kind: "quiz",
    title: "Pointers and Memory Leaks",
    summary: "Pointer arithmetic, ownership, and why Valgrind catches what it catches.",
    topicSlugs: ["c-pointers-memory", "systems-programming-robotics"],
    difficulty: "intermediate",
    estimatedMinutes: 15,
    questionCount: 10,
  },
  {
    slug: "concurrency-hazards",
    kind: "quiz",
    title: "Concurrency Hazards",
    summary: "Race conditions, deadlocks, and how to avoid them.",
    topicSlugs: ["multithreading-concurrency", "systems-programming-robotics"],
    difficulty: "advanced",
    estimatedMinutes: 12,
    questionCount: 8,
  },
  {
    slug: "pid-tuning-intuition",
    kind: "quiz",
    title: "PID Tuning Intuition",
    summary: "What each gain does and what symptoms tell you to change.",
    topicSlugs: ["pid-controllers", "building-moving-robots"],
    difficulty: "intermediate",
    estimatedMinutes: 10,
    questionCount: 8,
  },
  {
    slug: "motor-selection",
    kind: "quiz",
    title: "Motor Selection",
    summary: "DC vs stepper vs brushless — picking the right actuator.",
    topicSlugs: ["motor-selection", "building-moving-robots"],
    difficulty: "intermediate",
    estimatedMinutes: 12,
    questionCount: 7,
  },
  {
    slug: "forward-kinematics-chains",
    kind: "quiz",
    title: "Forward Kinematics on Chains",
    summary: "Composing transforms across a serial manipulator.",
    topicSlugs: ["forward-kinematics", "rigid-body-kinematics"],
    difficulty: "intermediate",
    estimatedMinutes: 15,
    questionCount: 8,
  },
  {
    slug: "ik-and-singularities",
    kind: "quiz",
    title: "IK & Singularities",
    summary: "When inverse kinematics has no solution, infinite solutions, or a singularity.",
    topicSlugs: ["inverse-kinematics", "jacobians-singularities", "rigid-body-kinematics"],
    difficulty: "advanced",
    estimatedMinutes: 18,
    questionCount: 8,
  },
  {
    slug: "ros2-architecture-quiz",
    kind: "quiz",
    title: "ROS 2 Architecture",
    summary: "DDS, QoS profiles, and lifecycle nodes.",
    topicSlugs: ["ros2-architecture", "ros2"],
    difficulty: "intermediate",
    estimatedMinutes: 12,
    questionCount: 8,
  },
  {
    slug: "bayesian-filtering-quiz",
    kind: "quiz",
    title: "Bayesian Filtering Concepts",
    summary: "Belief, prior, posterior, and the recursive Bayes filter.",
    topicSlugs: ["bayesian-filtering", "mobile-robotics-slam"],
    difficulty: "advanced",
    estimatedMinutes: 15,
    questionCount: 8,
  },
  {
    slug: "kalman-filter-quiz",
    kind: "quiz",
    title: "Kalman Filter Mechanics",
    summary: "Predict-update cycle and EKF linearization.",
    topicSlugs: ["kalman-filters", "mobile-robotics-slam", "linear-algebra-robotics"],
    difficulty: "advanced",
    estimatedMinutes: 20,
    questionCount: 10,
  },
  {
    slug: "lie-groups-quiz",
    kind: "quiz",
    title: "Lie Groups for Roboticists",
    summary: "SO(3), SE(3), exponential map.",
    topicSlugs: ["lie-groups", "advanced-math-robotics", "mobile-robotics-slam"],
    difficulty: "advanced",
    estimatedMinutes: 20,
    questionCount: 8,
  },
  {
    slug: "camera-models-quiz",
    kind: "quiz",
    title: "Camera Models",
    summary: "Pinhole, distortion, intrinsics vs extrinsics.",
    topicSlugs: ["camera-calibration", "perception-computer-vision"],
    difficulty: "intermediate",
    estimatedMinutes: 12,
    questionCount: 8,
  },
  {
    slug: "feature-detection-quiz",
    kind: "quiz",
    title: "Feature Detection",
    summary: "SIFT, ORB, FAST — how and when.",
    topicSlugs: ["feature-extraction", "perception-computer-vision"],
    difficulty: "intermediate",
    estimatedMinutes: 12,
    questionCount: 8,
  },
  // ---------- cross-topic / synthesis ----------
  {
    slug: "math-for-slam-review",
    kind: "quiz",
    title: "Math for SLAM Review",
    summary: "Cross-topic check across linear algebra, probability, and Lie groups.",
    topicSlugs: [
      "linear-algebra-robotics",
      "advanced-math-robotics",
      "lie-groups",
      "mobile-robotics-slam",
    ],
    difficulty: "advanced",
    estimatedMinutes: 25,
    questionCount: 12,
  },
  {
    slug: "control-stack-review",
    kind: "quiz",
    title: "Control Stack Review",
    summary: "From ODEs to PID — close the loop conceptually.",
    topicSlugs: ["calculus-robotics", "ordinary-differential-equations", "pid-controllers"],
    difficulty: "intermediate",
    estimatedMinutes: 18,
    questionCount: 10,
  },
  {
    slug: "perception-pipeline-review",
    kind: "quiz",
    title: "Perception Pipeline Review",
    summary: "Camera intrinsics, features, detection — chained.",
    topicSlugs: [
      "camera-calibration",
      "feature-extraction",
      "object-detection-segmentation",
      "perception-computer-vision",
    ],
    difficulty: "advanced",
    estimatedMinutes: 20,
    questionCount: 10,
  },
];

const challenges: ChallengeItem[] = [
  {
    slug: "implement-gauss-elimination",
    kind: "challenge",
    title: "Implement Gaussian Elimination",
    summary: "Solve Ax=b from scratch with partial pivoting.",
    topicSlugs: ["linear-systems", "linear-algebra-robotics"],
    difficulty: "beginner",
    estimatedMinutes: 60,
    language: "Python",
  },
  {
    slug: "least-squares-fit",
    kind: "challenge",
    title: "Least Squares Line Fit",
    summary: "Fit a line through noisy 2D points using normal equations.",
    topicSlugs: ["least-squares", "linear-algebra-robotics"],
    difficulty: "intermediate",
    estimatedMinutes: 75,
    language: "Python",
  },
  {
    slug: "astar-grid-pathfinding",
    kind: "challenge",
    title: "A* Grid Pathfinding",
    summary: "Build A* on a 2D occupancy grid with multiple heuristics.",
    topicSlugs: ["search-algorithms", "intro-ai-programming"],
    difficulty: "intermediate",
    estimatedMinutes: 120,
    language: "C++",
  },
  {
    slug: "cpp-linked-list",
    kind: "challenge",
    title: "C++ Linked List",
    summary: "Implement a templated doubly-linked list with iterators.",
    topicSlugs: ["cpp-fundamentals", "intro-ai-programming"],
    difficulty: "beginner",
    estimatedMinutes: 60,
    language: "C++",
  },
  {
    slug: "thread-safe-queue",
    kind: "challenge",
    title: "Thread-Safe Queue",
    summary: "Build a producer-consumer queue with mutexes and condition variables.",
    topicSlugs: ["multithreading-concurrency", "c-pointers-memory", "systems-programming-robotics"],
    difficulty: "advanced",
    estimatedMinutes: 120,
    language: "C++",
  },
  {
    slug: "valgrind-leak-hunt",
    kind: "challenge",
    title: "Valgrind Leak Hunt",
    summary: "Given a buggy C program, find and fix all leaks and UB.",
    topicSlugs: ["debugging-tools", "c-pointers-memory", "systems-programming-robotics"],
    difficulty: "intermediate",
    estimatedMinutes: 75,
    language: "C",
  },
  {
    slug: "pid-tuning-sim",
    kind: "challenge",
    title: "PID Tuning in Simulation",
    summary: "Tune Kp, Ki, Kd against a simulated motor to hit a setpoint.",
    topicSlugs: ["pid-controllers", "building-moving-robots"],
    difficulty: "intermediate",
    estimatedMinutes: 90,
    language: "Python",
  },
  {
    slug: "sensor-filter-implementation",
    kind: "challenge",
    title: "Sensor Filter Implementation",
    summary: "Implement a complementary filter for IMU data.",
    topicSlugs: ["digital-communications", "building-moving-robots"],
    difficulty: "intermediate",
    estimatedMinutes: 75,
    language: "C++",
  },
  {
    slug: "fk-six-dof-arm",
    kind: "challenge",
    title: "Forward Kinematics: 6-DOF Arm",
    summary: "Compose homogeneous transforms for a 6-DOF manipulator.",
    topicSlugs: ["forward-kinematics", "rigid-body-kinematics"],
    difficulty: "intermediate",
    estimatedMinutes: 90,
    language: "Python",
  },
  {
    slug: "ik-numeric-solver",
    kind: "challenge",
    title: "Numeric IK Solver",
    summary: "Build a Jacobian-based IK solver and detect singularities.",
    topicSlugs: ["inverse-kinematics", "jacobians-singularities", "rigid-body-kinematics"],
    difficulty: "advanced",
    estimatedMinutes: 150,
    language: "Python",
  },
  {
    slug: "ros2-talker-listener",
    kind: "challenge",
    title: "ROS 2 Talker/Listener",
    summary: "Build pub/sub nodes with custom message types.",
    topicSlugs: ["ros2-nodes-topics", "ros2"],
    difficulty: "intermediate",
    estimatedMinutes: 90,
    language: "C++",
  },
  {
    slug: "ekf-localization",
    kind: "challenge",
    title: "EKF Localization",
    summary: "Localize a 2D robot from noisy odometry and landmark observations.",
    topicSlugs: ["kalman-filters", "mobile-robotics-slam", "linear-algebra-robotics"],
    difficulty: "advanced",
    estimatedMinutes: 180,
    language: "Python",
  },
  {
    slug: "occupancy-grid-builder",
    kind: "challenge",
    title: "Occupancy Grid Builder",
    summary: "Build a probabilistic occupancy map from simulated LIDAR scans.",
    topicSlugs: ["occupancy-mapping", "mobile-robotics-slam"],
    difficulty: "advanced",
    estimatedMinutes: 150,
    language: "Python",
  },
  {
    slug: "camera-calibration-checkerboard",
    kind: "challenge",
    title: "Camera Calibration",
    summary: "Calibrate a camera from checkerboard images and report intrinsics.",
    topicSlugs: ["camera-calibration", "perception-computer-vision"],
    difficulty: "intermediate",
    estimatedMinutes: 90,
    language: "Python",
  },
  {
    slug: "orb-feature-matching",
    kind: "challenge",
    title: "ORB Feature Matching",
    summary: "Detect ORB features and match across two images with RANSAC.",
    topicSlugs: ["feature-extraction", "perception-computer-vision"],
    difficulty: "intermediate",
    estimatedMinutes: 90,
    language: "Python",
  },
  {
    slug: "visual-odometry-pipeline",
    kind: "challenge",
    title: "Visual Odometry Pipeline",
    summary: "Build a monocular VO pipeline using feature matches and essential matrix.",
    topicSlugs: ["visual-odometry", "feature-extraction", "perception-computer-vision"],
    difficulty: "advanced",
    estimatedMinutes: 180,
    language: "Python",
  },
  // ---------- cross-topic ----------
  {
    slug: "robot-arm-pick-place",
    kind: "challenge",
    title: "Robot Arm Pick-and-Place",
    summary: "Combine FK, IK, and a PID joint controller in simulation.",
    topicSlugs: [
      "forward-kinematics",
      "inverse-kinematics",
      "pid-controllers",
      "rigid-body-kinematics",
    ],
    difficulty: "advanced",
    estimatedMinutes: 240,
    language: "Python",
  },
];

const projects: ProjectItem[] = [
  {
    slug: "ballbot",
    kind: "project",
    title: "Ballbot",
    summary: "Build a robot that balances on a sphere using IMU + filtered control.",
    topicSlugs: [
      "building-moving-robots",
      "pid-controllers",
      "digital-communications",
      "manufacturing-cad",
    ],
    difficulty: "advanced",
    estimatedMinutes: 1800,
    deliverables: [
      "CAD assembly of chassis",
      "Microcontroller firmware reading IMU and driving motors",
      "Tuned outer-loop PID with telemetry",
      "Demo video of stable balance",
    ],
  },
  {
    slug: "astar-maze-runner",
    kind: "project",
    title: "A* Maze Runner",
    summary: "End-to-end maze solver with visualization and benchmarking.",
    topicSlugs: ["search-algorithms", "intro-ai-programming", "cpp-fundamentals"],
    difficulty: "intermediate",
    estimatedMinutes: 600,
    deliverables: [
      "C++ A* implementation with pluggable heuristics",
      "Visualizer for explored frontier",
      "Benchmarks vs Dijkstra and BFS",
    ],
  },
  {
    slug: "ekf-localization-project",
    kind: "project",
    title: "EKF Localization on a Mobile Robot",
    summary: "Localize a simulated mobile robot with an EKF in a known map.",
    topicSlugs: [
      "kalman-filters",
      "mobile-robotics-slam",
      "advanced-math-robotics",
      "linear-algebra-robotics",
    ],
    difficulty: "advanced",
    estimatedMinutes: 1200,
    deliverables: [
      "Sensor + motion model implementation",
      "EKF predict/update loop",
      "Convergence and divergence analysis under noise",
      "Writeup with trajectory plots",
    ],
  },
  {
    slug: "drivable-space-segmentation",
    kind: "project",
    title: "Drivable Space Segmentation",
    summary: "Train and deploy a YOLO + segmentation pipeline for outdoor drivable space.",
    topicSlugs: [
      "object-detection-segmentation",
      "perception-computer-vision",
      "systems-programming-robotics",
    ],
    difficulty: "advanced",
    estimatedMinutes: 1500,
    deliverables: [
      "Annotated dataset (or curated subset)",
      "Trained model with metrics",
      "Real-time inference demo",
      "ROS 2 node integration (bonus)",
    ],
  },
  {
    slug: "robot-arm-simulation",
    kind: "project",
    title: "ROS 2 Robot Arm Simulation",
    summary: "Spawn a 6-DOF arm in Gazebo, control it via ROS 2, demonstrate IK pick-and-place.",
    topicSlugs: [
      "ros2",
      "ros2-simulation",
      "rigid-body-kinematics",
      "inverse-kinematics",
    ],
    difficulty: "advanced",
    estimatedMinutes: 1500,
    deliverables: [
      "URDF for the manipulator",
      "ROS 2 nodes for IK + trajectory execution",
      "Gazebo demo with rviz visualization",
    ],
  },
  {
    slug: "least-squares-calibration",
    kind: "project",
    title: "Sensor Calibration via Least Squares",
    summary: "Calibrate a noisy sensor (IMU or rangefinder) end-to-end using linear regression.",
    topicSlugs: ["least-squares", "linear-algebra-robotics", "calculus-robotics"],
    difficulty: "intermediate",
    estimatedMinutes: 600,
    deliverables: [
      "Data collection script",
      "Calibration solver",
      "Residual analysis writeup",
    ],
  },
];

const all: PracticeItem[] = [...quizzes, ...challenges, ...projects];

export function listPracticeItems(kind?: PracticeKind): PracticeItem[] {
  return kind ? all.filter((item) => item.kind === kind) : all.slice();
}

export function listByTopic(topicSlug: string, kind?: PracticeKind): PracticeItem[] {
  return listPracticeItems(kind).filter((item) => item.topicSlugs.includes(topicSlug));
}

export function getPracticeItem(slug: string): PracticeItem | null {
  return all.find((item) => item.slug === slug) ?? null;
}

export function listTopicSlugsWithPractice(kind: PracticeKind): string[] {
  const slugs = new Set<string>();
  for (const item of listPracticeItems(kind)) {
    for (const topicSlug of item.topicSlugs) slugs.add(topicSlug);
  }
  return Array.from(slugs);
}

export interface PracticeFilters {
  topics?: string[];
  phases?: string[];
  difficulties?: Difficulty[];
  kind?: PracticeKind;
}

export function filterPractice(items: PracticeItem[], filters: PracticeFilters): PracticeItem[] {
  return items.filter((item) => {
    if (filters.kind && item.kind !== filters.kind) return false;
    if (filters.topics && filters.topics.length > 0) {
      const hit = filters.topics.some((slug) => item.topicSlugs.includes(slug));
      if (!hit) return false;
    }
    if (filters.difficulties && filters.difficulties.length > 0) {
      if (!filters.difficulties.includes(item.difficulty)) return false;
    }
    return true;
  });
}
