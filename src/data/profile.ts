import type { NavItem, Project, SkillGroup, SocialLink, TimelineEntry } from '@/types';

// Every fact in this file comes from Rajkiran's resume or previous portfolio.
// Do not add experience, metrics or links that are not verifiable there.

export const profile = {
  firstName: 'Rajkiran',
  lastName: 'Jaiswar',
  fullName: 'Rajkiran Jaiswar',
  initials: 'RJ',
  role: 'Full Stack Developer',
  location: 'Mumbai, India',
  yearsExperience: '3+',
  email: 'rajjaiswar1256@gmail.com',
  phone: '+91 82862 31170',
  // wa.me wants digits only, country code first
  whatsapp: '918286231170',
  whatsappMessage: 'Hi Rajkiran, I came across your portfolio and would like to talk about a project.',
  resumeUrl: '/files/Rajkiran-Jaiswar-Resume.pdf',
  portrait: '/images/rajkiran.webp',
  intro:
    'I build scalable, production-ready web applications — robust APIs, efficient database queries and responsive, user-focused interfaces.',
  summary:
    'Full Stack Developer with 3+ years of experience building scalable, production-ready web applications. Skilled in developing robust APIs, writing efficient database queries, and crafting responsive, user-focused interfaces.',
  aboutParagraphs: [
    'My work spans both sides of the stack: Angular front-ends with reusable components, Node.js and Express services, and the MSSQL, PostgreSQL and MongoDB layers underneath them.',
    'I care about clean, maintainable code. I take part in peer code reviews, help set coding standards, and work closely with cross-functional teams from sprint planning to on-time delivery.',
  ],
  availability: 'Open to full-time roles and freelance work',
} as const;

export const socials: SocialLink[] = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/rajkiranjaiswar/', handle: 'in/rajkiranjaiswar' },
  { label: 'GitHub', href: 'https://github.com/Rajkiran-125', handle: '@Rajkiran-125' },
  // Opens a chat with the message already typed in (app on phones, WhatsApp Web on desktop)
  {
    label: 'WhatsApp',
    href: `https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(profile.whatsappMessage)}`,
    handle: profile.phone,
  },
  { label: 'Email', href: `mailto:${profile.email}`, handle: profile.email },
];

export const navItems: NavItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Work' },
  { id: 'experience', label: 'Journey' },
  { id: 'contact', label: 'Contact' },
];

export const stats = [
  { value: '3+', label: 'Years shipping production apps' },
  { value: '3', label: 'Featured full-stack builds' },
  { value: '4', label: 'Databases in daily use' },
] as const;

export const skillGroups: SkillGroup[] = [
  {
    id: 'frontend',
    title: 'Frontend',
    blurb: 'Lazy-loaded Angular modules, reusable components, reactive data flows.',
    skills: ['Angular', 'TypeScript', 'JavaScript', 'RxJS', 'Angular Material', 'React', 'HTML', 'CSS', 'Chart.js'],
  },
  {
    id: 'backend',
    title: 'Backend',
    blurb: 'REST APIs and services built for reliability under load.',
    skills: ['Node.js', 'Express.js', 'REST APIs', 'Microservices', 'Socket.io', 'JWT Auth', 'Rate Limiting', 'Cron Jobs', 'Swagger', 'Logging'],
  },
  {
    id: 'data',
    title: 'Data',
    blurb: 'Stored-procedure driven SQL, query tuning, reporting.',
    skills: ['MSSQL', 'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Node-Cache'],
  },
  {
    id: 'infra',
    title: 'Infra & Flow',
    blurb: 'Queues, containers and pipelines that keep releases boring.',
    skills: ['RabbitMQ', 'Docker', 'GitLab CI', 'Jenkins', 'Git', 'GitLab', 'Firebase'],
  },
];

export const projects: Project[] = [
  {
    id: 'pitch',
    index: '01',
    title: 'UNFYD.PITCH',
    subtitle: 'Omnichannel Campaign Management Platform',
    context: 'Company project · SmartConnect',
    summary:
      'A full-stack platform for creating, scheduling and executing targeted campaigns across WhatsApp, Email, SMS and Voice.',
    highlights: [
      'Rule-based audience segmentation, consent management and Excel-driven audience uploads',
      'Express REST APIs on a stored-procedure MSSQL layer with JWT/JWE auth and AES-encrypted payloads',
      'RabbitMQ batch processing and restart-safe schedulers for high-volume dispatch',
      'Chart.js funnel & trend dashboards, filterable data tables, Excel/PDF exports',
    ],
    stack: ['Angular', 'TypeScript', 'RxJS', 'Angular Material', 'Chart.js', 'Node.js', 'Express', 'MSSQL', 'MongoDB', 'RabbitMQ', 'JWT'],
    image: { src: '/images/project-pitch.webp', alt: 'UNFYD.PITCH campaign dashboard with campaign stats and table', width: 1400, height: 467 },
  },
  {
    id: 'nest4us',
    index: '02',
    title: 'NEST4US',
    subtitle: 'Volunteer Management System',
    context: 'Freelance · US-based NGO',
    summary:
      'A live, actively-used volunteer portal where volunteers log service hours with photo proof and earn recognition tiers.',
    highlights: [
      'Admin approval workflows for submitted service hours',
      'JWT and Google OAuth authentication with role-based access',
      'Chart.js analytics dashboards and client-side PDF / Excel exports',
    ],
    stack: ['Angular 18', 'TypeScript', 'RxJS', 'Angular Material', 'Node.js', 'Express', 'MongoDB', 'Chart.js', 'JWT', 'Google OAuth'],
    image: { src: '/images/project-nest4us.webp', alt: 'NEST4US volunteer dashboard showing lifetime hours and recognition tier', width: 1400, height: 658 },
    liveUrl: 'https://ngofontend.web.app/login',
  },
  {
    id: 'chat',
    index: '03',
    title: 'Real-Time Chat',
    subtitle: 'Instant Messaging Application',
    context: 'Personal project',
    summary: 'Sign up, log in and chat instantly with anyone, anywhere — powered by live bidirectional sockets.',
    highlights: [
      'Live bidirectional communication with Socket.io',
      'Online / offline presence and private conversations',
      'Responsive Angular interface, hosted on Firebase',
    ],
    stack: ['Angular', 'Node.js', 'Socket.io', 'HTML', 'CSS', 'Firebase'],
    image: { src: '/images/project-chat.webp', alt: 'Real-time chat app with a conversation between two users', width: 1400, height: 797 },
    liveUrl: 'https://chat-app-frontend-12bbe.web.app/',
  },
];

export const timeline: TimelineEntry[] = [
  {
    id: 'cnergee',
    period: 'Sep 2026 — Present',
    role: 'Full Stack Developer',
    org: 'Cnergee Technologies',
    kind: 'work',
    points: [
      'Building a web-based Sales CRM for a 50-user sales team end to end, delivering the MVP on a 10-day timeline.',
      'Contributed to an SD-WAN Orchestrator platform, developing features and REST APIs for centralised network device management.',
    ],
    stack: ['Node.js', 'Express.js', 'Angular', 'MySQL'],
  },
  {
    id: 'smartconnect',
    period: 'May 2023 — Jul 2026',
    role: 'Full Stack Developer',
    org: 'SmartConnect Technologies Pvt Ltd',
    place: 'On-site · Mumbai',
    kind: 'work',
    points: [
      'Built and maintained responsive Angular + Node.js applications with reusable components that sped up delivery across projects.',
      'Designed RESTful APIs connecting Angular front-ends to Node.js services and MSSQL databases.',
      'Wrote and optimised complex SQL for dynamic data handling, reporting and performance.',
      'Contributed to peer code reviews and helped establish team coding standards.',
    ],
    stack: ['Angular', 'Node.js', 'MSSQL', 'SQL'],
  },
  {
    id: 'freelance',
    period: 'Freelance project',
    role: 'Full Stack Developer',
    org: 'NEST4US — US-based NGO',
    place: 'Freelance',
    kind: 'freelance',
    points: [
      'Delivered a live volunteer management portal end to end — auth, approval workflows, analytics and exports.',
    ],
    stack: ['Angular 18', 'Chart.js', 'JWT', 'Google OAuth'],
  },
];

export const marqueeWords = ['Angular', 'Node.js', 'Express', 'TypeScript', 'MSSQL', 'MongoDB', 'RabbitMQ', 'Redis', 'Socket.io', 'Docker'];
