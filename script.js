const STORAGE_KEY = 'student-management-system';

const initialStudents = [
  {
    id: 'STU-1001',
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    course: 'Computer Science',
    year: 2,
    status: 'Active',
  },
  {
    id: 'STU-1002',
    name: 'Benjamin Lee',
    email: 'ben.lee@example.com',
    course: 'Business Administration',
    year: 3,
    status: 'On Leave',
  },
  {
    id: 'STU-1003',
    name: 'Carla Smith',
    email: 'carla.smith@example.com',
    course: 'Psychology',
    year: 4,
    status: 'Graduated',
  },
];

const studentForm = document.getElementById('student-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const studentTableBody = document.getElementById('student-table-body');
const searchInput = document.getElementById('search-input');

const studentIdInput = document.getElementById('student-id');
const studentNameInput = document.getElementById('student-name');
const studentEmailInput = document.getElementById('student-email');
const studentCourseInput = document.getElementById('student-course');
const studentYearInput = document.getElementById('student-year');
const studentStatusInput = document.getElementById('student-status');

const totalStudentsValue = document.getElementById('total-students');
const activeStudentsValue = document.getElementById('active-students');
const graduatedStudentsValue = document.getElementById('graduated-students');

let students = JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialStudents;
let editingId = null;

function saveStudents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function getStatusClass(status) {
  switch (status) {
    case 'Active':
      return 'status-active';
    case 'On Leave':
      return 'status-leave';
    case 'Graduated':
      return 'status-graduated';
    default:
      return 'status-active';
  }
}

function renderStats() {
  totalStudentsValue.textContent = students.length;
  activeStudentsValue.textContent = students.filter((student) => student.status === 'Active').length;
  graduatedStudentsValue.textContent = students.filter((student) => student.status === 'Graduated').length;
}

function renderStudents() {
  const query = searchInput.value.trim().toLowerCase();
  const filteredStudents = students.filter((student) => {
    const searchable = [
      student.id,
      student.name,
      student.email,
      student.course,
      String(student.year),
      student.status,
    ].join(' ').toLowerCase();

    return searchable.includes(query);
  });

  if (!filteredStudents.length) {
    studentTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">No students found.</td>
      </tr>
    `;
    return;
  }

  studentTableBody.innerHTML = filteredStudents
    .map(
      (student) => `
        <tr>
          <td>${student.id}</td>
          <td>${student.name}</td>
          <td>${student.course}</td>
          <td>${student.year}</td>
          <td>
            <span class="status-badge ${getStatusClass(student.status)}">${student.status}</span>
          </td>
          <td>
            <div class="action-buttons">
              <button class="action-btn edit-btn" data-action="edit" data-id="${student.id}">Edit</button>
              <button class="action-btn delete-btn" data-action="delete" data-id="${student.id}">Delete</button>
            </div>
          </td>
        </tr>
      `
    )
    .join('');
}

function resetForm() {
  studentForm.reset();
  studentStatusInput.value = 'Active';
  editingId = null;
  formTitle.textContent = 'Add Student';
  submitBtn.textContent = 'Add Student';
  cancelBtn.classList.add('hidden');
}

function handleSubmit(event) {
  event.preventDefault();

  const studentData = {
    id: studentIdInput.value.trim(),
    name: studentNameInput.value.trim(),
    email: studentEmailInput.value.trim(),
    course: studentCourseInput.value.trim(),
    year: Number(studentYearInput.value),
    status: studentStatusInput.value,
  };

  if (!studentData.id || !studentData.name || !studentData.email || !studentData.course || !studentData.year) {
    alert('Please fill in all fields before submitting.');
    return;
  }

  if (!editingId) {
    const duplicate = students.some((student) => student.id.toLowerCase() === studentData.id.toLowerCase());
    if (duplicate) {
      alert('A student with this ID already exists.');
      return;
    }

    students.unshift(studentData);
  } else {
    students = students.map((student) =>
      student.id.toLowerCase() === editingId.toLowerCase() ? { ...student, ...studentData } : student
    );
  }

  saveStudents();
  renderStats();
  renderStudents();
  resetForm();
}

function populateForm(studentId) {
  const currentStudent = students.find((student) => student.id.toLowerCase() === studentId.toLowerCase());

  if (!currentStudent) return;

  editingId = currentStudent.id;
  formTitle.textContent = 'Edit Student';
  submitBtn.textContent = 'Save Changes';
  cancelBtn.classList.remove('hidden');

  studentIdInput.value = currentStudent.id;
  studentNameInput.value = currentStudent.name;
  studentEmailInput.value = currentStudent.email;
  studentCourseInput.value = currentStudent.course;
  studentYearInput.value = currentStudent.year;
  studentStatusInput.value = currentStudent.status;
}

function deleteStudent(studentId) {
  const shouldDelete = window.confirm('Are you sure you want to remove this student?');
  if (!shouldDelete) return;

  students = students.filter((student) => student.id.toLowerCase() !== studentId.toLowerCase());

  if (editingId && editingId.toLowerCase() === studentId.toLowerCase()) {
    resetForm();
  }

  saveStudents();
  renderStats();
  renderStudents();
}

studentForm.addEventListener('submit', handleSubmit);
searchInput.addEventListener('input', renderStudents);
cancelBtn.addEventListener('click', resetForm);

studentTableBody.addEventListener('click', (event) => {
  const actionButton = event.target.closest('button');
  if (!actionButton) return;

  const { action, id } = actionButton.dataset;
  if (action === 'edit') populateForm(id);
  if (action === 'delete') deleteStudent(id);
});

renderStats();
renderStudents();
