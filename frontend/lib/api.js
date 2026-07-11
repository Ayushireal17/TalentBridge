import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 150000, // 150s — covers Gemini retries (up to 3x with backoff)
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("tb_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("tb_token");
      localStorage.removeItem("tb_user");
      window.location.href = "/auth/login";
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register:       (data) => api.post("/auth/register", data),
  login:          (data) => api.post("/auth/login", data),
  adminLogin:     (data) => api.post("/auth/admin-login", data),
  logout:         ()     => api.post("/auth/logout"),
  me:             ()     => api.get("/auth/me"),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword:  (data)  => api.post("/auth/reset-password", data),
};

export const resumeAPI = {
  list:       ()         => api.get("/candidate/resumes"),
  upload:     (form)     => api.post("/candidate/resumes", form, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
  parse:      (form)     => api.post("/candidate/resumes/parse", form, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
  get:        (id)       => api.get(`/candidate/resumes/${id}`),
  delete:     (id)       => api.delete(`/candidate/resumes/${id}`),
  setPrimary: (id)       => api.post(`/candidate/resumes/${id}/set-primary`),
  analyze:    (id, role) => api.post(`/candidate/resumes/${id}/analyze`, { target_role: role }),
  getAnalysis:(id)       => api.get(`/candidate/resumes/${id}/analysis`),
};

export const jobAPI = {
  list:        (params)       => api.get("/jobs", { params }),
  get:         (id)           => api.get(`/jobs/${id}`),
  recommended: ()             => api.get("/candidate/jobs/recommended"),
  apply:       (jobId, data)  => api.post(`/candidate/jobs/${jobId}/apply`, data),
  applications:()             => api.get("/candidate/applications"),
  saveJob:     (id)           => api.post(`/candidate/jobs/${id}/save`),
  unsaveJob:   (id)           => api.delete(`/candidate/jobs/${id}/save`),
  savedJobs:   ()             => api.get("/candidate/saved-jobs"),
  matchJob:    (id)           => api.post(`/candidate/jobs/${id}/match`),
};

export const recruiterAPI = {
  jobs:           ()           => api.get("/recruiter/jobs"),
  createJob:      (data)       => api.post("/recruiter/jobs", data),
  updateJob:      (id, d)      => api.put(`/recruiter/jobs/${id}`, d),
  deleteJob:      (id)         => api.delete(`/recruiter/jobs/${id}`),
  toggleJob:      (id)         => api.post(`/recruiter/jobs/${id}/toggle-active`),
  applicants:     (jobId)      => api.get(`/recruiter/jobs/${jobId}/applicants`),
  rankCandidates: (jobId)      => api.post(`/recruiter/jobs/${jobId}/rank-candidates`),
  updateStatus:   (jobId, appId, status, note) => api.put(`/recruiter/jobs/${jobId}/applicants/${appId}/status`, { status, recruiter_note: note }),
  dashboard:      ()           => api.get("/recruiter/dashboard"),
  analytics:      ()           => api.get("/recruiter/analytics"),
};

export const aiAPI = {
  // Chatbot
  chat:                (messages, role) => api.post("/ai/chat", { messages, role }),

  // Cover letters
  generateCoverLetter: (job_id, tone)   => api.post("/candidate/cover-letters", { job_id, tone }),
  coverLetters:        ()               => api.get("/candidate/cover-letters"),

  // Interview
  listInterviews:      ()               => api.get("/candidate/interview-sessions"),
  createSession:       (data)           => api.post("/candidate/interview-sessions", data),
  getInterview:        (id)             => api.get(`/candidate/interview-sessions/${id}`),
  submitAnswers:       (id, answers)    => api.post(`/candidate/interview-sessions/${id}/submit-answers`, { answers }),
  evaluateInterview:   (id)             => api.post(`/candidate/interview-sessions/${id}/evaluate`),
  deleteInterview:     (id)             => api.delete(`/candidate/interview-sessions/${id}`),

  // Job match
  matchJob:            (jobId)          => api.post(`/candidate/jobs/${jobId}/match`),
};

export const profileAPI = {
  get:          ()     => api.get("/profile"),
  update:       (data) => api.put("/profile", data),
  updateAvatar: (form) => api.post("/profile/avatar", form, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
};

export const adminAPI = {
  overview:    ()           => api.get("/admin/analytics/overview"),
  users:       (params)     => api.get("/admin/users", { params }),
  toggleUser:  (id)         => api.post(`/admin/users/${id}/toggle-active`),
  changeRole:  (id, role)   => api.post(`/admin/users/${id}/change-role`, { role }),
  jobs:        (params)     => api.get("/admin/jobs", { params }),
  toggleJob:   (id)         => api.post(`/admin/jobs/${id}/toggle-active`),
};

export default api;
