import React, { useState } from 'react';
import { NAVNEET_GUPTA_PROFILE, DeveloperProfile } from '../data/developerData';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  ExternalLink,
  Copy,
  Check,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Sparkles,
  Database,
  Brain,
  Cpu,
  Layers,
  Send,
  CheckCircle2,
  Terminal,
  Calendar,
  Star,
  Flame,
} from 'lucide-react';

interface DeveloperDetailsPageProps {
  onShowToast?: (msg: string) => void;
}

export const DeveloperDetailsPage: React.FC<DeveloperDetailsPageProps> = ({
  onShowToast,
}) => {
  const profile: DeveloperProfile = NAVNEET_GUPTA_PROFILE;
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Quick message builder state
  const [inquiryType, setInquiryType] = useState<string>('Job Opportunity / Hiring');
  const [senderName, setSenderName] = useState<string>('');
  const [senderEmail, setSenderEmail] = useState<string>('');
  const [messageBody, setMessageBody] = useState<string>(
    'Hi Navneet,\n\nI reviewed your portfolio and TestPilot project. We are impressed by your full-stack engineering and machine learning expertise and would love to connect regarding an opportunity.'
  );
  const [messageSent, setMessageSent] = useState<boolean>(false);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    if (onShowToast) {
      onShowToast(`Copied ${label} to clipboard: ${text}`);
    }
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`[${inquiryType}] Inquiring from TestPilot Platform`);
    const body = encodeURIComponent(
      `From: ${senderName || 'Developer'} (${senderEmail || 'N/A'})\n\n${messageBody}`
    );
    window.open(`mailto:${profile.email}?subject=${subject}&body=${body}`, '_blank');
    setMessageSent(true);
    if (onShowToast) {
      onShowToast('Prepared email draft in your default client!');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-[#58A6FF]/10 text-[#58A6FF] border border-[#58A6FF]/20">
              <User className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-[#F0F6FC] tracking-tight">
              Contact & Project Developer Details
            </h1>
          </div>
          <p className="text-xs text-[#8B949E] mt-1">
            Author, Full Stack Software Engineer, and Machine Learning Specialist
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#238636]/15 text-[#3FB950] border border-[#3FB950]/30 text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-[#3FB950] animate-pulse"></span>
            <span>Available for Opportunities</span>
          </span>
        </div>
      </div>

      {/* Main Developer Hero Card */}
      <div className="rounded-xl bg-gradient-to-b from-[#161B22] to-[#0D1117] border border-[#30363D] p-6 shadow-md relative overflow-hidden">
        {/* Subtle background glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1F6FEB]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Avatar & Core Info */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-[#1F6FEB] to-[#58A6FF] flex items-center justify-center text-[#F0F6FC] font-mono font-bold text-2xl shadow-lg border border-[#58A6FF]/40">
                NG
              </div>
              <div>
                <div className="flex items-center space-x-2.5">
                  <h2 className="text-2xl font-bold text-[#F0F6FC] tracking-tight">
                    {profile.name}
                  </h2>
                  <span className="px-2 py-0.5 rounded bg-[#1F6FEB]/20 text-[#58A6FF] text-[11px] font-mono font-bold border border-[#1F6FEB]/40">
                    Lead Developer
                  </span>
                </div>
                <p className="text-sm text-[#8B949E] font-medium mt-0.5">
                  {profile.title}
                </p>
                <div className="flex items-center space-x-2 text-xs text-[#8B949E] mt-1 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-[#E3B341]" />
                  <span>{profile.location}</span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <p className="text-xs text-[#C9D1D9] leading-relaxed max-w-3xl border-l-2 border-[#58A6FF] pl-3 py-0.5 bg-[#0B0E14]/40 rounded-r-md">
              {profile.summary}
            </p>

            {/* Quick Contact & Profile Action Strip */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {/* Portfolio Link */}
              <a
                href={profile.portfolio}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#238636] hover:bg-[#2EA043] text-white text-xs font-semibold shadow-sm transition border border-[#3FB950]/30"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Live Portfolio</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>

              {/* GitHub Link */}
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#F0F6FC] text-xs font-semibold transition border border-[#30363D]"
              >
                <Github className="w-3.5 h-3.5 text-[#F0F6FC]" />
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3 text-[#8B949E]" />
              </a>

              {/* LinkedIn Link */}
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#0A66C2]/20 hover:bg-[#0A66C2]/35 text-[#58A6FF] hover:text-[#79C0FF] text-xs font-semibold transition border border-[#0A66C2]/40"
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span>LinkedIn</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>

              {/* Email Direct */}
              <button
                onClick={() => handleCopy(profile.email, 'Email')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#161B22] hover:bg-[#21262D] text-[#C9D1D9] hover:text-[#F0F6FC] text-xs font-mono transition border border-[#30363D] cursor-pointer"
                title="Click to copy email address"
              >
                <Mail className="w-3.5 h-3.5 text-[#58A6FF]" />
                <span>{profile.email}</span>
                {copiedField === 'Email' ? (
                  <Check className="w-3 h-3 text-[#3FB950]" />
                ) : (
                  <Copy className="w-3 h-3 text-[#8B949E]" />
                )}
              </button>

              {/* Phone Direct */}
              <button
                onClick={() => handleCopy(profile.phone, 'Phone')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#161B22] hover:bg-[#21262D] text-[#C9D1D9] hover:text-[#F0F6FC] text-xs font-mono transition border border-[#30363D] cursor-pointer"
                title="Click to copy phone number"
              >
                <Phone className="w-3.5 h-3.5 text-[#3FB950]" />
                <span>{profile.phone}</span>
                {copiedField === 'Phone' ? (
                  <Check className="w-3 h-3 text-[#3FB950]" />
                ) : (
                  <Copy className="w-3 h-3 text-[#8B949E]" />
                )}
              </button>
            </div>
          </div>

          {/* Quick Metrics & Highlights Card (4 cols) */}
          <div className="lg:col-span-4 bg-[#0B0E14] border border-[#30363D] rounded-lg p-4 space-y-3">
            <div className="text-xs font-mono font-bold text-[#8B949E] uppercase tracking-wider flex items-center justify-between pb-2 border-b border-[#30363D]">
              <span className="flex items-center space-x-1.5 text-[#F0F6FC]">
                <Sparkles className="w-3.5 h-3.5 text-[#E3B341]" />
                <span>Developer Highlights</span>
              </span>
              <span className="text-[#58A6FF]">AKTU 2027</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded bg-[#161B22] border border-[#30363D]">
                <div className="text-base font-mono font-bold text-[#58A6FF]">6+ Mos</div>
                <div className="text-[10px] text-[#8B949E] mt-0.5">Industry Internships</div>
              </div>
              <div className="p-2.5 rounded bg-[#161B22] border border-[#30363D]">
                <div className="text-base font-mono font-bold text-[#3FB950]">A++ Grade</div>
                <div className="text-[10px] text-[#8B949E] mt-0.5">ML Internship Rating</div>
              </div>
              <div className="p-2.5 rounded bg-[#161B22] border border-[#30363D]">
                <div className="text-base font-mono font-bold text-[#E3B341]">5,000+</div>
                <div className="text-[10px] text-[#8B949E] mt-0.5">Medical Images CNN</div>
              </div>
              <div className="p-2.5 rounded bg-[#161B22] border border-[#30363D]">
                <div className="text-base font-mono font-bold text-[#F0F6FC]">6 Certs</div>
                <div className="text-[10px] text-[#8B949E] mt-0.5">Verified Credentials</div>
              </div>
            </div>

            <div className="pt-1 text-[11px] text-[#8B949E] space-y-1">
              <div className="flex items-center justify-between">
                <span>Specialization:</span>
                <span className="text-[#C9D1D9] font-medium">MERN, Python & Deep Learning</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Degree:</span>
                <span className="text-[#C9D1D9] font-medium">B.Tech Computer Science</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Experience & Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Work Experience Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#F0F6FC] flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-[#58A6FF]" />
              <span>Professional Industry Experience</span>
            </h2>
            <span className="text-xs font-mono text-[#8B949E]">
              {profile.experience.length} Positions
            </span>
          </div>

          <div className="space-y-4">
            {profile.experience.map((exp, idx) => (
              <div
                key={idx}
                className="rounded-lg bg-[#161B22] border border-[#30363D] p-4.5 space-y-3 hover:border-[#58A6FF]/40 transition"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-[#F0F6FC]">{exp.role}</h3>
                      {exp.grade && (
                        <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#E3B341]/15 text-[#E3B341] border border-[#E3B341]/30 text-[10px] font-bold font-mono">
                          <Star className="w-3 h-3 fill-current" />
                          <span>A++ Grade</span>
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#58A6FF] font-medium mt-0.5">
                      {exp.company}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono text-[#8B949E] flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{exp.period}</span>
                    </div>
                    <span className="inline-block mt-0.5 px-2 py-0.2 rounded bg-[#0B0E14] text-[#8B949E] border border-[#30363D] text-[10px] font-mono">
                      {exp.locationType}
                    </span>
                  </div>
                </div>

                {/* Highlights List */}
                <ul className="space-y-1.5 text-xs text-[#C9D1D9] pl-1">
                  {exp.highlights.map((h, hIdx) => (
                    <li key={hIdx} className="flex items-start space-x-2">
                      <span className="text-[#3FB950] mt-1 shrink-0">▸</span>
                      <span className="leading-relaxed">{h}</span>
                    </li>
                  ))}
                </ul>

                {/* Tech Badges */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#30363D]/60">
                  {exp.skills.map((s, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 rounded bg-[#0B0E14] text-[#8B949E] text-[10px] font-mono border border-[#30363D]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Education Card */}
          <div className="rounded-lg bg-[#161B22] border border-[#30363D] p-4.5 space-y-2">
            <h3 className="text-sm font-bold text-[#F0F6FC] flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-[#58A6FF]" />
              <span>Formal Education</span>
            </h3>
            <div className="p-3 rounded-lg bg-[#0B0E14] border border-[#30363D] flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-[#F0F6FC]">
                  {profile.education.degree}
                </div>
                <div className="text-xs text-[#58A6FF] mt-0.5">
                  {profile.education.institution}
                </div>
                <div className="text-[11px] text-[#8B949E] mt-0.5">
                  {profile.education.location}
                </div>
              </div>
              <span className="text-xs font-mono text-[#8B949E] bg-[#161B22] px-2.5 py-1 rounded border border-[#30363D]">
                {profile.education.period}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Projects & Skills (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Projects Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#F0F6FC] flex items-center space-x-2">
                <Code className="w-4 h-4 text-[#58A6FF]" />
                <span>Featured Technical Projects</span>
              </h2>
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-[#58A6FF] hover:underline flex items-center space-x-1"
              >
                <span>View GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-4">
              {profile.projects.map((proj, pIdx) => (
                <div
                  key={pIdx}
                  className="rounded-lg bg-[#161B22] border border-[#30363D] p-4 space-y-2.5 hover:border-[#58A6FF]/40 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-[#F0F6FC]">
                        {proj.title}
                      </h3>
                      {proj.badge && (
                        <span className="inline-block mt-0.5 text-[10px] font-mono text-[#58A6FF] bg-[#1F6FEB]/15 px-2 py-0.2 rounded border border-[#1F6FEB]/30">
                          {proj.badge}
                        </span>
                      )}
                    </div>

                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded bg-[#0B0E14] text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D] border border-[#30363D] transition"
                        title="View Source on GitHub"
                      >
                        <Github className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <ul className="space-y-1 text-[11px] text-[#C9D1D9]">
                    {proj.highlights.map((h, hIdx) => (
                      <li key={hIdx} className="flex items-start space-x-1.5">
                        <span className="text-[#58A6FF] mt-0.5">•</span>
                        <span className="leading-relaxed">{h}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap items-center gap-1 pt-1.5 border-t border-[#30363D]/60">
                    {proj.techStack.map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-1.5 py-0.2 rounded bg-[#0B0E14] text-[#8B949E] text-[9px] font-mono border border-[#30363D]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications Section */}
          <div className="rounded-lg bg-[#161B22] border border-[#30363D] p-4.5 space-y-3">
            <h3 className="text-sm font-bold text-[#F0F6FC] flex items-center space-x-2">
              <Award className="w-4 h-4 text-[#E3B341]" />
              <span>Verified Certifications & Credentials</span>
            </h3>

            <div className="space-y-1.5">
              {profile.certifications.map((cert, cIdx) => (
                <div
                  key={cIdx}
                  className="flex items-center space-x-2 p-2 rounded bg-[#0B0E14] border border-[#30363D] text-xs text-[#C9D1D9]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3FB950] shrink-0" />
                  <span className="font-medium text-[11px]">{cert}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Technical Skills Matrix */}
      <div className="rounded-lg bg-[#161B22] border border-[#30363D] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#F0F6FC] flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-[#58A6FF]" />
            <span>Technical Skills & Engineering Stack</span>
          </h2>
          <span className="text-xs font-mono text-[#8B949E]">
            End-to-End Full Stack & Machine Learning
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {profile.technicalSkills.map((cat, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg bg-[#0B0E14] border border-[#30363D] space-y-2"
            >
              <div className="text-xs font-mono font-bold text-[#58A6FF] flex items-center space-x-1.5">
                {cat.category.includes('Languages') && <Code className="w-3.5 h-3.5" />}
                {cat.category.includes('Web') && <Globe className="w-3.5 h-3.5" />}
                {cat.category.includes('Databases') && <Database className="w-3.5 h-3.5" />}
                {cat.category.includes('Machine Learning') && <Brain className="w-3.5 h-3.5" />}
                {cat.category.includes('Tools') && <Terminal className="w-3.5 h-3.5" />}
                <span>{cat.category}</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {cat.skills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="px-2 py-0.5 rounded bg-[#161B22] hover:bg-[#21262D] text-[#C9D1D9] text-xs font-mono border border-[#30363D] transition"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Direct Contact & Collaboration Form */}
      <div className="rounded-xl bg-[#161B22] border border-[#30363D] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-[#30363D]">
          <div>
            <h2 className="text-base font-bold text-[#F0F6FC] flex items-center space-x-2">
              <Mail className="w-4 h-4 text-[#58A6FF]" />
              <span>Connect Directly with Navneet Gupta</span>
            </h2>
            <p className="text-xs text-[#8B949E] mt-0.5">
              Send an inquiry, schedule a technical interview, or discuss full-stack & AI projects
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-[#8B949E]">Direct Email:</span>
            <button
              onClick={() => handleCopy(profile.email, 'Email')}
              className="text-[#58A6FF] hover:underline cursor-pointer flex items-center space-x-1"
            >
              <span>{profile.email}</span>
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSendMessage} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#C9D1D9] mb-1">
                Inquiry Topic
              </label>
              <select
                value={inquiryType}
                onChange={(e) => setInquiryType(e.target.value)}
                className="w-full bg-[#0B0E14] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#C9D1D9] focus:outline-none focus:border-[#58A6FF]"
              >
                <option value="Job Opportunity / Hiring">Full-Time / Hiring Opportunity</option>
                <option value="Internship / Contract Role">Internship / Contract Role</option>
                <option value="Technical Collaboration">Technical Collaboration / AI Project</option>
                <option value="Code Review & Consultation">Code Review & Architecture</option>
                <option value="General Networking">General Networking</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#C9D1D9] mb-1">
                Your Name / Organization
              </label>
              <input
                type="text"
                placeholder="e.g. Lead Architect, Tech Corp"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full bg-[#0B0E14] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#C9D1D9] focus:outline-none focus:border-[#58A6FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#C9D1D9] mb-1">
                Your Email Address
              </label>
              <input
                type="email"
                placeholder="your.email@company.com"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="w-full bg-[#0B0E14] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#C9D1D9] focus:outline-none focus:border-[#58A6FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#C9D1D9] mb-1">
              Message Content
            </label>
            <textarea
              rows={4}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              className="w-full bg-[#0B0E14] border border-[#30363D] rounded-lg p-3 text-xs text-[#C9D1D9] focus:outline-none focus:border-[#58A6FF] font-sans"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center space-x-3 text-xs text-[#8B949E]">
              <span className="flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3FB950]" />
                <span>Responsive within 24 hours</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1 font-mono">
                <MapPin className="w-3.5 h-3.5 text-[#E3B341]" />
                <span>Greater Noida / Remote</span>
              </span>
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    `Subject: [${inquiryType}]\n\n${messageBody}`,
                    'Message Text'
                  )
                }
                className="px-3.5 py-2 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] text-xs font-medium border border-[#30363D] transition cursor-pointer"
              >
                Copy Draft
              </button>

              <button
                type="submit"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#1F6FEB] hover:bg-[#388BFD] text-white text-xs font-bold shadow-sm transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Launch Email Draft to Navneet</span>
              </button>
            </div>
          </div>

          {messageSent && (
            <div className="p-3 rounded-lg bg-[#238636]/15 border border-[#3FB950]/30 text-xs text-[#3FB950] flex items-center space-x-2 font-mono">
              <Check className="w-4 h-4 shrink-0" />
              <span>
                Email client triggered with recipient <strong>{profile.email}</strong>. Looking forward to connecting!
              </span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
