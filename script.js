// script.js — Student Management (frontend only, using localStorage)
const STORAGE_KEY = 'kirtism_students_v1';

const $ = id => document.getElementById(id);
const studentForm = $('studentForm');
const studentsTbody = $('studentsTbody');
const searchInput = $('search');
const exportJsonBtn = $('exportJson');
const importJsonBtn = $('importJsonBtn');
const importFile = $('importFile');

let students = [];

// Load existing students
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    students = raw ? JSON.parse(raw) : [];
  } catch {
    students = [];
  }
  renderTable();
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function renderTable(filter='') {
  const f = filter.trim().toLowerCase();
  studentsTbody.innerHTML = '';

  const list = students.filter(s =>
    s.name.toLowerCase().includes(f) ||
    s.roll.toLowerCase().includes(f) ||
    s.course.toLowerCase().includes(f)
  );

  if(list.length === 0){
    studentsTbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#8a6a7b;padding:18px">No students found.</td></tr>`;
    return;
  }

  list.forEach((s, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i+1}</td>
      <td>${s.name}</td>
      <td>${s.roll}</td>
      <td>${s.course}</td>
      <td>${s.year}</td>
      <td class="actions">
        <button class="edit" onclick="startEdit(${i})">Edit</button>
        <button class="del" onclick="deleteStudent(${i})">Delete</button>
      </td>`;
    studentsTbody.appendChild(tr);
  });
}

function clearForm(){
  $('name').value='';
  $('roll').value='';
  $('course').value='';
  $('year').value='';
  $('editIndex').value='-1';
  $('saveBtn').textContent='Save Student';
}

studentForm.addEventListener('submit', function(e){
  e.preventDefault();
  const idx = parseInt($('editIndex').value);

  const student = {
    name: $('name').value.trim(),
    roll: $('roll').value.trim(),
    course: $('course').value.trim(),
    year: $('year').value.trim()
  };

  if(idx >= 0) {
    students[idx] = student;
  } else {
    students.push(student);
  }

  saveToStorage();
  renderTable(searchInput.value);
  clearForm();
});

function deleteStudent(index){
  students.splice(index,1);
  saveToStorage();
  renderTable(searchInput.value);
}

function startEdit(index){
  const s = students[index];
  $('name').value = s.name;
  $('roll').value = s.roll;
  $('course').value = s.course;
  $('year').value = s.year;
  $('editIndex').value = index;
  $('saveBtn').textContent = 'Update Student';
}

searchInput.addEventListener('input', () => renderTable(searchInput.value));

exportJsonBtn.addEventListener('click', () => {
  const data = JSON.stringify(students, null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'students.json';
  a.click();
  URL.revokeObjectURL(url);
});

importJsonBtn.addEventListener('click', () => importFile.click());

importFile.addEventListener('change', ev => {
  const f = ev.target.files[0];
  if(!f) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      students = JSON.parse(reader.result);
      saveToStorage();
      renderTable();
    } catch {
      alert('Invalid JSON file!');
    }
  };
  reader.readAsText(f);
});

load();
