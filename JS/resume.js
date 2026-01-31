import { auth, db } from './firebase-config.js';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

let currentUser = null;
let editingResumeId = null;

// ================= AUTH CHECK =================
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    loadResumeData(); 
  } else {
    window.location.href = 'login.html';
  }
});

// ================= DYNAMIC FIELDS =================
let educationCount = 0;  
let experienceCount = 0; 

window.addEducation = function () {
  // ================= CHANGE HERE =================
  const educationList = document.getElementById('education-list');
  const educationItem = document.createElement('div');
  educationItem.className = 'dynamic-item';

  educationItem.innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label>Degree</label>
        <input type="text" name="education[${educationCount}][degree]">
      </div>
      <div class="form-group">
        <label>Institution</label>
        <input type="text" name="education[${educationCount}][institution]">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Year</label>
        <input type="text" name="education[${educationCount}][year]">
      </div>
      <div class="form-group">
        <button type="button" class="btn-remove" onclick="removeItem(this)">Remove</button>
      </div>
    </div>
  `;
  educationList.appendChild(educationItem);

  educationCount++; 
};

window.addExperience = function () {
  // ================= CHANGE HERE =================
  const experienceList = document.getElementById('experience-list');
  const experienceItem = document.createElement('div');
  experienceItem.className = 'dynamic-item';

  experienceItem.innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label>Job Title</label>
        <input type="text" name="experience[${experienceCount}][title]">
      </div>
      <div class="form-group">
        <label>Company</label>
        <input type="text" name="experience[${experienceCount}][company]">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Duration</label>
        <input type="text" name="experience[${experienceCount}][duration]">
      </div>
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea name="experience[${experienceCount}][description]" rows="3"></textarea>
    </div>
    <button type="button" class="btn-remove" onclick="removeItem(this)">Remove</button>
  `;
  experienceList.appendChild(experienceItem);

  experienceCount++; 
};

window.removeItem = function (btn) {
  btn.closest('.dynamic-item').remove();
};

// ================= FORM SUBMIT =================
const resumeForm = document.getElementById('resume-form');

if (resumeForm) {
  resumeForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("User not authenticated");
      return;
    }

    const formData = new FormData(resumeForm);

    const resumeData = {
      userId: currentUser.uid,
      personalInfo: {
        fullName: formData.get('fullName'),
        jobTitle: formData.get('jobTitle'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        location: formData.get('location'),
        summary: formData.get('summary')
      },
      education: [],
      experience: [],
      skills: formData.get('skills')
        ? formData.get('skills').split(',').map(s => s.trim())
        : [],
      template: formData.get('template'),
      updatedAt: new Date().toISOString()
    };

    // ===== EDUCATION PARSE =====
    for (let [key, value] of formData.entries()) {
      if (key.startsWith('education')) {
        const match = key.match(/education\[(\d+)\]\[(\w+)\]/);
        if (match) {
          const index = parseInt(match[1]);
          if (!resumeData.education[index]) resumeData.education[index] = {};
          resumeData.education[index][match[2]] = value;
        }
      }
    }
    resumeData.education = resumeData.education.filter(Boolean);

    // ===== EXPERIENCE PARSE =====
    for (let [key, value] of formData.entries()) {
      if (key.startsWith('experience')) {
        const match = key.match(/experience\[(\d+)\]\[(\w+)\]/);
        if (match) {
          const index = parseInt(match[1]);
          if (!resumeData.experience[index]) resumeData.experience[index] = {};
          resumeData.experience[index][match[2]] = value;
        }
      }
    }
    resumeData.experience = resumeData.experience.filter(Boolean);

    try {
      if (editingResumeId) {
        const docRef = doc(db, 'resumes', editingResumeId);
        await updateDoc(docRef, resumeData);
        window.location.href = `preview-resume.html?id=${editingResumeId}`;
      } else {
        resumeData.createdAt = new Date().toISOString();
        const docRef = await addDoc(collection(db, 'resumes'), resumeData);
        window.location.href = `preview-resume.html?id=${docRef.id}`;
      }
    } catch (err) {
      console.error("Resume save error:", err);
      alert("Failed to save resume");
    }
  });
}

// ================= LOAD EDIT DATA =================
async function loadResumeData() {
  const params = new URLSearchParams(window.location.search);
  editingResumeId = params.get('id');

  if (!editingResumeId) return;

  try {
    const docRef = doc(db, 'resumes', editingResumeId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) return;

    const data = snap.data();

    resumeForm.fullName.value = data.personalInfo.fullName;
    resumeForm.jobTitle.value = data.personalInfo.jobTitle;
    resumeForm.email.value = data.personalInfo.email;
    resumeForm.phone.value = data.personalInfo.phone;
    resumeForm.location.value = data.personalInfo.location;
    resumeForm.summary.value = data.personalInfo.summary;
    resumeForm.skills.value = data.skills.join(', ');

    document.querySelector(`input[value="${data.template}"]`).checked = true;

    // ===== LOAD EDUCATION =====
    data.education.forEach(e => {
      addEducation();
      const last = document.querySelectorAll('#education-list .dynamic-item');
      const item = last[last.length - 1];
      item.querySelector('input[name*="degree"]').value = e.degree || '';
      item.querySelector('input[name*="institution"]').value = e.institution || '';
      item.querySelector('input[name*="year"]').value = e.year || '';
    });

    // ===== LOAD EXPERIENCE =====
    data.experience.forEach(ex => {
      addExperience();
      const last = document.querySelectorAll('#experience-list .dynamic-item');
      const item = last[last.length - 1];
      item.querySelector('input[name*="title"]').value = ex.title || '';
      item.querySelector('input[name*="company"]').value = ex.company || '';
      item.querySelector('input[name*="duration"]').value = ex.duration || '';
      item.querySelector('textarea').value = ex.description || '';
    });

  } catch (err) {
    console.error("Load resume error:", err);
  }
}
