/* ══════════════════════════════════════════════════════
   INTERNMO PROJECT PORTAL — APPLICATION LOGIC
   app.js — Full interactive logic matching 7-step guide
══════════════════════════════════════════════════════ */

'use strict';

// ── Project Database ──────────────────────────────────
const projectsDatabase = [
  {
    id: 'proj-waym-260702',
    code: 'PROJ-WAYM-260702 · UI/UX',
    title: 'Waymo CabinOS',
    domain: 'ui/ux',
    difficulty: 'moderate',
    priority: 'High',
    assignedOn: '30 Aug, 2026',
    courseEnds: '29 Nov, 2026',
    progress: 0,
    status: 'IN PROGRESS',
    snippet: 'Waymo RideOS is an advanced in-cabin passenger experience platform designed for Level 4 and Level 5 autonomous vehicles. The system enhances trust and transparency in self-driving transportation...',
    fullDesc: 'Waymo RideOS is an advanced in-cabin passenger experience platform designed for Level 4 and Level 5 autonomous vehicles. The system enhances trust and transparency in self-driving transportation by providing real-time route visualization, vehicle status monitoring, AI-powered driving explanations, entertainment and productivity controls, emergency assistance features, and comprehensive accessibility support. Designed for future robotaxi services, Waymo RideOS transforms autonomous travel into a safe, intelligent, and personalized experience while helping passengers understand and confidently interact with their driverless journey.',
    deliverables: [
      'Comprehensive in-cabin touch display interface design (1920x1080 & 4K automotive specs)',
      'Passenger trust & vehicle telemetry visualization system',
      'Emergency stop & remote teleoperation communication modal',
      'Accessibility design for visually impaired & elderly passengers',
      'Figma design system token catalog & interactive prototype'
    ]
  },
  {
    id: 'proj-lms-884102',
    code: 'PROJ-ILMS-884102 · UI/UX',
    title: 'Internmo Learning Management System UI/UX Redesign',
    domain: 'ui/ux',
    difficulty: 'easy',
    priority: 'Medium',
    assignedOn: '15 Sep, 2026',
    courseEnds: '15 Dec, 2026',
    progress: 0,
    status: 'IN PROGRESS',
    snippet: 'Complete overhaul of the Internmo student portal dashboard, grading workflow, project request modal, and mentor-student live evaluation feedback system...',
    fullDesc: 'A student-centered redesign of the Internmo LMS ecosystem. Focus on reducing cognitive load during project selection, streamlining submission verification, implementing gamified progress milestones, and enhancing dark/light theme ergonomics for university cohorts.',
    deliverables: [
      'Student dashboard architecture & wireframes',
      'Project request & 5-minute unlock UX flow',
      'Grading & certificate issuance dashboard',
      'Design token repository & WCAG AAA accessibility audit'
    ]
  },
  {
    id: 'proj-sky-512093',
    code: 'PROJ-SKYP-512093 · UI/UX & Web',
    title: 'SkyPath Modern Airline Booking System',
    domain: 'ui/ux',
    difficulty: 'advanced',
    priority: 'High',
    assignedOn: '01 Oct, 2026',
    courseEnds: '10 Jan, 2027',
    progress: 0,
    status: 'IN PROGRESS',
    snippet: 'Next-generation airline booking engine with seamless seat selection, multi-city fare comparison, baggage tracking, and biometric check-in UI...',
    fullDesc: 'SkyPath delivers an ultra-smooth booking experience for commercial aviation passengers. Includes 3D interactive aircraft seat selection, transparent pricing breakdowns, live flight disruption alerts, and integration with digital boarding passes.',
    deliverables: [
      'Interactive 3D seat map selection interface',
      'Multi-currency fare comparison calculator',
      'Baggage RFID tracking & airport terminal navigation',
      'Mobile-responsive check-in & boarding pass generator'
    ]
  },
  {
    id: 'proj-nexora-994201',
    code: 'PROJ-NXOR-994201 · Cybersecurity',
    title: 'Nexora Systems — AD Red Team Simulation Lab',
    domain: 'cybersecurity',
    difficulty: 'advanced',
    priority: 'Critical',
    assignedOn: '18 Oct, 2026',
    courseEnds: '30 Dec, 2026',
    progress: 0,
    status: 'IN PROGRESS',
    snippet: 'Offensive security emulation platform simulating Active Directory compromise, Kerberoasting, DCSync, LSASS memory harvesting, and Golden Ticket forgery...',
    fullDesc: 'Advanced adversary emulation lab built for enterprise security analysts. Emulate full MITRE ATT&CK kill chain across enterprise Windows domain environments, test EDR detection boundaries, and orchestrate automated privilege escalation workflows.',
    deliverables: [
      'BloodHound graph visualization & attack path analyzer',
      'Kerberoasting & DCSync attack simulation module',
      'Mimikatz memory dump parser & credential harvester',
      'MITRE ATT&CK kill chain telemetry dashboard'
    ]
  },
  {
    id: 'proj-prompt-339104',
    code: 'PROJ-PRMP-339104 · AI / Prompt Engineering',
    title: 'PromptCraft AI Workflow Assistant',
    domain: 'ai',
    difficulty: 'moderate',
    priority: 'Medium',
    assignedOn: '05 Oct, 2026',
    courseEnds: '15 Jan, 2027',
    progress: 0,
    status: 'IN PROGRESS',
    snippet: 'Autonomous multi-agent prompt evaluation suite with automated few-shot optimization, hallucination guardrails, and latency benchmarking...',
    fullDesc: 'A developer-facing workbench for creating, evaluating, and fine-tuning prompt chains across LLM models. Features automated unit tests for reasoning accuracy, token expenditure optimization, and safety guardrail auditing.',
    deliverables: [
      'Multi-agent prompt evaluation pipeline',
      'Few-shot prompt optimizer & benchmark harness',
      'Hallucination detection scoring algorithm',
      'Exportable JSON prompt template catalog'
    ]
  }
];

// ── Application State ─────────────────────────────────
const appState = {
  currentView: 'dashboard',
  activeProject: projectsDatabase[0], // Defaults to Waymo CabinOS (matching PDF)
  selectedModalProject: null,
  activeDifficultyFilter: 'all',
  activeDomain: 'ui/ux',
  countdownInterval: null,
  countdownSeconds: 299, // 4 mins 59 secs
  submissions: [],
  selectedFile: null
};

// ── Navigation ────────────────────────────────────────
function navigateTo(view, event) {
  if (event) event.preventDefault();
  
  appState.currentView = view;
  
  // Toggle Views
  document.querySelectorAll('.content-view').forEach(v => v.classList.remove('active'));
  const viewEl = document.getElementById(`view-${view}`);
  if (viewEl) viewEl.classList.add('active');

  // Update Breadcrumb
  const sectionLabel = document.getElementById('breadcrumbSection');
  if (sectionLabel) {
    sectionLabel.textContent = view === 'dashboard' ? 'Overview' : appState.activeProject.title;
  }

  // Update Sidebar active state
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  const navItem = document.getElementById(`nav-${view}`);
  if (navItem) navItem.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openProjectDetails() {
  updateProjectDetailsView();
  navigateTo('project-details');
}

// ── Render Project Details View ───────────────────────
function updateProjectDetailsView() {
  const p = appState.activeProject;
  
  // Heading & Code
  document.getElementById('detailProjectHeading').textContent = p.title;
  document.getElementById('detailProjectCode').textContent = p.code;
  document.getElementById('detailFullDescription').textContent = p.fullDesc;
  document.getElementById('detailPriority').textContent = p.priority;
  document.getElementById('detailAssignedOn').textContent = p.assignedOn;
  document.getElementById('detailCourseEnds').textContent = p.courseEnds;
  document.getElementById('detailProgressText').textContent = `${p.progress}%`;
  document.getElementById('detailBadge').textContent = p.status;
  
  // Card on dashboard
  document.getElementById('cardProjectTitle').textContent = p.title;
  document.getElementById('cardProjectDesc').textContent = p.snippet;
  document.getElementById('cardDomain').textContent = p.domain.toUpperCase();
  document.getElementById('cardProgressText').textContent = `${p.progress}%`;
  document.getElementById('cardProgressBar').style.width = `${p.progress}%`;
  
  // Stepper state
  updateStepperState(p.progress);
}

function updateStepperState(progress) {
  const stepPending = document.getElementById('step-pending');
  const stepInprogress = document.getElementById('step-inprogress');
  const stepSubmitted = document.getElementById('step-submitted');
  const stepCompleted = document.getElementById('step-completed');
  const lineSub = document.getElementById('line-sub');
  const lineComp = document.getElementById('line-comp');

  if (progress === 0) {
    stepPending.className = 'step-item step-completed';
    stepInprogress.className = 'step-item step-active';
    stepSubmitted.className = 'step-item step-pending';
    stepCompleted.className = 'step-item step-pending';
    lineSub.classList.remove('active-line');
    lineComp.classList.remove('active-line');
  } else if (progress > 0 && progress < 100) {
    stepPending.className = 'step-item step-completed';
    stepInprogress.className = 'step-item step-completed';
    stepSubmitted.className = 'step-item step-active';
    stepCompleted.className = 'step-item step-pending';
    lineSub.classList.add('active-line');
    lineComp.classList.remove('active-line');
  } else {
    stepPending.className = 'step-item step-completed';
    stepInprogress.className = 'step-item step-completed';
    stepSubmitted.className = 'step-item step-completed';
    stepCompleted.className = 'step-item step-completed';
    lineSub.classList.add('active-line');
    lineComp.classList.add('active-line');
  }
}

// ── New Project Modal (Steps 2, 3, 4) ─────────────────
function openNewProjectModal() {
  const modal = document.getElementById('newProjectModal');
  modal.classList.add('open');
  populateProjectDropdown();
}

function closeNewProjectModal() {
  const modal = document.getElementById('newProjectModal');
  modal.classList.remove('open');
}

function onDomainChange() {
  const domain = document.getElementById('domainSelector').value;
  appState.activeDomain = domain;
  
  // Update Course Pill in topbar to reflect domain!
  const courseLabels = {
    'ui/ux': 'Course - UI/UX',
    'cybersecurity': 'Course - Cybersecurity / AD',
    'webdev': 'Course - Fullstack Web',
    'ai': 'Course - Prompt Engineering'
  };
  document.getElementById('activeCourseLabel').textContent = courseLabels[domain] || 'Course - UI/UX';
  
  populateProjectDropdown();
  showToast(`Domain switched to: ${domain.toUpperCase()}`);
}

function filterDifficulty(diff) {
  appState.activeDifficultyFilter = diff;
  document.querySelectorAll('.diff-btn').forEach(btn => btn.classList.remove('active'));
  const btn = document.getElementById(`diff-${diff}`);
  if (btn) btn.classList.add('active');

  populateProjectDropdown();
}

function populateProjectDropdown() {
  const select = document.getElementById('projectSelectDropdown');
  select.innerHTML = '<option value="" disabled selected>--- Select a Project ---</option>';

  const domain = appState.activeDomain;
  const diff = appState.activeDifficultyFilter;

  const filtered = projectsDatabase.filter(p => {
    const matchDomain = (domain === 'ui/ux' && p.domain === 'ui/ux') ||
                        (domain === 'cybersecurity' && p.domain === 'cybersecurity') ||
                        (domain === 'webdev' && (p.domain === 'webdev' || p.domain === 'ui/ux')) ||
                        (domain === 'ai' && p.domain === 'ai');
    const matchDiff = (diff === 'all') || (p.difficulty === diff);
    return matchDomain && matchDiff;
  });

  filtered.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.title;
    select.appendChild(opt);
  });

  // Reset description preview
  document.getElementById('projectDescriptionGroup').style.display = 'none';
  appState.selectedModalProject = null;
}

function onProjectSelectChange() {
  const select = document.getElementById('projectSelectDropdown');
  const projId = select.value;
  const project = projectsDatabase.find(p => p.id === projId);

  if (project) {
    appState.selectedModalProject = project;
    const descGroup = document.getElementById('projectDescriptionGroup');
    const descBox = document.getElementById('modalProjectDescription');
    descBox.textContent = project.fullDesc;
    descGroup.style.display = 'block';
  }
}

// ── Submit Project Request (Steps 4 & 5) ───────────────
function submitProjectRequest() {
  if (!appState.selectedModalProject) {
    showToast('Please select a project from the dropdown first');
    return;
  }

  const approach = document.getElementById('approachInput').value;
  const project = appState.selectedModalProject;

  closeNewProjectModal();
  showToast('Project request submitted successfully! Awaiting verification...');

  // Switch card to Awaiting Unlock state
  document.getElementById('activeProjectCard').style.display = 'none';
  const unlockCard = document.getElementById('awaitingUnlockCard');
  unlockCard.style.display = 'flex';
  document.getElementById('awaitingTitle').textContent = project.title;

  // Start 5-minute Countdown
  startCountdown(project);
}

function startCountdown(project) {
  if (appState.countdownInterval) clearInterval(appState.countdownInterval);
  appState.countdownSeconds = 299; // 04:59

  const display = document.getElementById('countdownDisplay');

  function update() {
    const m = Math.floor(appState.countdownSeconds / 60);
    const s = appState.countdownSeconds % 60;
    display.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

    if (appState.countdownSeconds <= 0) {
      clearInterval(appState.countdownInterval);
      unlockProjectNow(project);
    } else {
      appState.countdownSeconds--;
    }
  }

  update();
  appState.countdownInterval = setInterval(update, 1000);
}

// Admin Fast Unlock Button
function instantUnlockProject() {
  if (appState.countdownInterval) clearInterval(appState.countdownInterval);
  const targetProject = appState.selectedModalProject || projectsDatabase[0];
  unlockProjectNow(targetProject);
}

function unlockProjectNow(project) {
  appState.activeProject = project;
  
  // Hide locked card, show active project card
  document.getElementById('awaitingUnlockCard').style.display = 'none';
  const activeCard = document.getElementById('activeProjectCard');
  activeCard.style.display = 'flex';

  updateProjectDetailsView();
  showToast(`🎉 Project Unlocked: "${project.title}" is ready to work!`);
}

// ── Download Project Document (Step 7 in PDF!) ────────
function downloadProjectDocument() {
  const p = appState.activeProject;
  
  // Generate formatted official project specification file
  const docContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Internmo Project Brief — ${p.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; max-width: 800px; margin: 0 auto; }
    .header { border-bottom: 3px solid #0f233d; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
    .brand { font-size: 24px; font-weight: 800; color: #0f233d; }
    .brand span { color: #f59e0b; }
    .code { font-size: 13px; color: #64748b; font-weight: 600; }
    h1 { font-size: 26px; color: #0f172a; margin: 0 0 8px; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 20px 0; }
    .meta-item strong { display: block; font-size: 11px; color: #94a3b8; text-transform: uppercase; }
    .meta-item span { font-size: 14px; font-weight: 700; color: #0f172a; }
    h2 { font-size: 18px; color: #0f233d; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 30px; }
    ul { padding-left: 20px; }
    li { margin-bottom: 8px; }
    .rubric { width: 100%; border-collapse: collapse; margin-top: 14px; }
    .rubric th, .rubric td { border: 1px solid #e2e8f0; padding: 10px 12px; font-size: 13px; text-align: left; }
    .rubric th { background: #f1f5f9; font-weight: 700; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand"><span>in</span> internmo</div>
      <div class="code">OFFICIAL CAPSTONE PROJECT BRIEF & SPECIFICATION</div>
    </div>
    <div class="code">${p.code}</div>
  </div>

  <h1>${p.title}</h1>
  <p style="font-size: 15px; color: #334155;">${p.fullDesc}</p>

  <div class="meta-box">
    <div class="meta-item"><strong>Priority</strong><span style="color:#ef4444">${p.priority}</span></div>
    <div class="meta-item"><strong>Assigned On</strong><span>${p.assignedOn}</span></div>
    <div class="meta-item"><strong>Course Ends</strong><span>${p.courseEnds}</span></div>
    <div class="meta-item"><strong>Domain</strong><span>${p.domain.toUpperCase()}</span></div>
  </div>

  <h2>Key Deliverables & Objectives</h2>
  <ul>
    ${p.deliverables.map(d => `<li>${d}</li>`).join('')}
  </ul>

  <h2>Evaluation & Grading Rubric (100 Points Total)</h2>
  <table class="rubric">
    <thead>
      <tr><th>Criterion</th><th>Weight</th><th>Requirements</th></tr>
    </thead>
    <tbody>
      <tr><td>Problem Architecture & Research</td><td>25%</td><td>User personas, journey mapping, edge-case analysis</td></tr>
      <tr><td>Visual Design & System Fidelity</td><td>30%</td><td>Consistent design tokens, typography hierarchy, responsive specs</td></tr>
      <tr><td>Interactive Prototyping & Flow</td><td>25%</td><td>Functional transitions, realistic states, accessibility compliance</td></tr>
      <tr><td>Documentation & Defense</td><td>20%</td><td>Clean README/Figma notes, design trade-off rationale, presentation</td></tr>
    </tbody>
  </table>

  <div class="footer">
    Internmo Academic Mentorship Portal · Verified Capstone Curriculum · All Rights Reserved
  </div>
</body>
</html>`;

  const blob = new Blob([docContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Internmo_Project_Brief_${p.id}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast(`📄 Downloaded: Internmo_Project_Brief_${p.id}.html`);
}

// ── Submission Modal & Flow ───────────────────────────
function openSubmissionModal() {
  document.getElementById('submissionModal').classList.add('open');
}

function closeSubmissionModal() {
  document.getElementById('submissionModal').classList.remove('open');
  appState.selectedFile = null;
  document.getElementById('dropZoneText').textContent = 'Click or Drag & Drop project ZIP / PDF / Code here';
}

function triggerFileInput() {
  document.getElementById('fileInput').click();
}

function handleFileSelected(event) {
  const file = event.target.files[0];
  if (file) {
    appState.selectedFile = file;
    document.getElementById('dropZoneText').textContent = `Selected: ${file.name} (${(file.size / (1024*1024)).toFixed(2)} MB)`;
  }
}

function confirmSubmission() {
  const file = appState.selectedFile;
  const demoUrl = document.getElementById('demoUrlInput').value.trim();
  const remarks = document.getElementById('submissionRemarks').value.trim();

  if (!file && !demoUrl) {
    showToast('Please select a file or provide a project repository URL');
    return;
  }

  const filename = file ? file.name : (demoUrl.includes('github') ? 'GitHub Repository' : 'Project Prototype URL');
  const now = new Date();
  const dateStr = `${now.getDate()} ${now.toLocaleString('default', { month: 'short' })}, ${now.getFullYear()} · ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  // Record submission
  appState.submissions.unshift({
    filename: filename,
    url: demoUrl,
    date: dateStr,
    status: 'UNDER REVIEW'
  });

  // Update Project Progress to 50%
  appState.activeProject.progress = 50;
  appState.activeProject.status = 'UNDER REVIEW';

  // Render submissions in table
  renderSubmissionsList();
  updateProjectDetailsView();
  closeSubmissionModal();

  showToast('🚀 Deliverables submitted successfully for evaluation!');
}

function renderSubmissionsList() {
  const emptyState = document.getElementById('emptySubmissionState');
  const list = document.getElementById('submissionsList');
  const countBadge = document.getElementById('submissionCount');

  if (appState.submissions.length === 0) {
    emptyState.style.display = 'block';
    list.style.display = 'none';
    countBadge.textContent = '0 submissions';
  } else {
    emptyState.style.display = 'none';
    list.style.display = 'flex';
    countBadge.textContent = `${appState.submissions.length} submission${appState.submissions.length > 1 ? 's' : ''}`;

    list.innerHTML = '';
    appState.submissions.forEach(sub => {
      const item = document.createElement('div');
      item.className = 'submission-record';
      item.innerHTML = `
        <div class="sub-file-info">
          <span class="sub-icon">📦</span>
          <div>
            <div class="sub-filename">${escapeHtml(sub.filename)}</div>
            <div class="sub-meta">${sub.date} ${sub.url ? `· <a href="${escapeHtml(sub.url)}" target="_blank" style="color:#2563eb;text-decoration:underline;">View Link</a>` : ''}</div>
          </div>
        </div>
        <span class="sub-status">${sub.status}</span>
      `;
      list.appendChild(item);
    });
  }
}

// ── Generic Feature Modal & Dropdowns ─────────────────
function showFeatureModal(featureName, event) {
  if (event) event.preventDefault();
  const modal = document.getElementById('featureModal');
  document.getElementById('featureModalTitle').textContent = featureName;
  document.getElementById('featureModalHeading').textContent = `${featureName} Hub`;
  document.getElementById('featureModalBody').textContent = `Explore the ${featureName} suite for your internship track. Modules, practice tests, and resources are synchronized with your account.`;
  modal.classList.add('open');
}

function closeFeatureModal() {
  document.getElementById('featureModal').classList.remove('open');
}

function toggleSubmenu(id, event) {
  if (event) event.preventDefault();
  const menu = document.getElementById(id);
  const parent = event.currentTarget;
  menu.classList.toggle('show');
  parent.classList.toggle('open');
}

function toggleNotifications() {
  const menu = document.getElementById('notifMenu');
  menu.classList.toggle('open');
}

function toggleUserDropdown() {
  const menu = document.getElementById('userMenu');
  menu.classList.toggle('open');
}

function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  sb.classList.toggle('open');
}

// Close dropdowns on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('.notification-wrap')) {
    document.getElementById('notifMenu')?.classList.remove('open');
  }
  if (!e.target.closest('.user-profile')) {
    document.getElementById('userMenu')?.classList.remove('open');
  }
});

// ── Toast System ──────────────────────────────────────
function showToast(msg) {
  const hub = document.getElementById('toastHub');
  if (!hub) return;

  const toast = document.createElement('div');
  toast.className = 'toast-item';
  toast.innerHTML = `
    <span style="font-size:16px;">💡</span>
    <span>${escapeHtml(msg)}</span>
  `;
  hub.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Initialization ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateProjectDetailsView();
  populateProjectDropdown();

  // Dynamic Date
  const now = new Date();
  const dateStr = `${now.getDate()} ${now.toLocaleString('default', { month: 'short' })}, ${now.getFullYear()}`;
  const subDateEl = document.getElementById('todaySubDate');
  if (subDateEl) subDateEl.textContent = dateStr;

  // Drag & drop support
  const dropZone = document.getElementById('dropZone');
  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = '#2563eb';
    });
    dropZone.addEventListener('dragleave', () => {
      dropZone.style.borderColor = '#94a3b8';
    });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = '#94a3b8';
      if (e.dataTransfer.files.length > 0) {
        appState.selectedFile = e.dataTransfer.files[0];
        document.getElementById('dropZoneText').textContent = `Selected: ${appState.selectedFile.name} (${(appState.selectedFile.size / (1024*1024)).toFixed(2)} MB)`;
      }
    });
  }
});
