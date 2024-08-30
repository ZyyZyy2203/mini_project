let students = JSON.parse(localStorage.getItem('students')) || [];
const studentTable = document.getElementById('student-table').getElementsByTagName('tbody')[0];

function renderTable() {
    //Sắp xếp học sinh
    students.sort((a, b) => {
        // Di chuyển những học sinh chưa hoàn tất thanh toán lên đầu
        if (a.completionStatus === "Chưa hoàn thành" && b.completionStatus === "Hoàn thành") return -1;
        if (a.completionStatus === "Hoàn thành" && b.completionStatus === "Chưa hoàn thành") return 1;

        // Sắp xếp theo ngày thanh toán
        return new Date(a.amountDate) - new Date(b.amountDate);
    });

    studentTable.innerHTML = '';
    students.forEach((student, index) => {
        const row = studentTable.insertRow();

        // Tính số ngày còn lại để thanh toán
        const paymentDate = new Date(student.amountDate);
        const today = new Date();
        const daysLeft = Math.ceil((paymentDate - today) / (1000 * 60 * 60 * 24));

        // Áp dụng các kiểu cảnh báo
        if (daysLeft <= 3 && student.completionStatus === "Chưa hoàn thành") {
            row.style.backgroundColor = daysLeft < 0 ? 'red' : 'yellow';
            console.log("tttettêt")
        }

        row.innerHTML = `
                    <td>${student.name}</td>
                    <td>${student.gender}</td>
                    <td>${student.amountPaid}</td>
                    <td>${student.completionStatus}</td>
                    <td>${student.amountDate}</td>
                    <td>${student.birthDate}</td>
                    <td>${student.address}</td>
                    <td>
                        <button class="btn btn-warning btn-edit" data-index="${index}" data-bs-toggle="modal" data-bs-target="#editStudentModal">Sửa</button>
                        <button class="btn btn-danger btn-delete" data-index="${index}">Xóa</button>
                    </td>
                `;
    });

    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            const student = students[index];
            // Điền dữ liệu của học sinh đã chọn vào biểu mẫu chỉnh sửa
            document.getElementById('editIndex').value = index;
            document.getElementById('editStudentName').value = student.name;
            document.getElementById('editGender').value = student.gender;
            document.getElementById('editAmountPaid').value = student.amountPaid;
            document.getElementById('editCompletionStatus').value = student.completionStatus;
            document.getElementById('editamountDate').value = student.amountDate;
            document.getElementById('editBirthDate').value = student.birthDate;
            document.getElementById('editAddress').value = student.address;
        });
    });

    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            if (confirm('Bạn có chắc chắn muốn xóa học sinh này?')) {
                students.splice(index, 1);
                saveStudents();
                renderTable();
            }
        });
    });
}

document.getElementById('saveStudentBtn').addEventListener('click', () => {
    const student = {
        name: document.getElementById('studentName').value,
        gender: document.getElementById('gender').value,
        amountPaid: document.getElementById('amountPaid').value,
        completionStatus: document.getElementById('completionStatus').value,
        amountDate: document.getElementById('amountDate').value,
        birthDate: document.getElementById('birthDate').value,
        address: document.getElementById('address').value,
    };

    if (Object.values(student).some(value => !value)) {
        alert('Vui lòng điền đầy đủ thông tin.');
        return;
    }

    students.push(student);
    saveStudents();
    renderTable();
    document.getElementById('addStudentForm').reset();
    const addStudentModal = bootstrap.Modal.getInstance(document.getElementById('addStudentModal'));
    addStudentModal.hide();
});

document.getElementById('updateStudentBtn').addEventListener('click', () => {
    const index = document.getElementById('editIndex').value;
    const student = {
        name: document.getElementById('editStudentName').value,
        gender: document.getElementById('editGender').value,
        amountPaid: document.getElementById('editAmountPaid').value,
        completionStatus: document.getElementById('editCompletionStatus').value,
        amountDate: document.getElementById('editamountDate').value,
        birthDate: document.getElementById('editBirthDate').value,
        address: document.getElementById('editAddress').value,
    };

    if (Object.values(student).some(value => !value)) {
        alert('Vui lòng điền đầy đủ thông tin.');
        return;
    }

    students[index] = student;
    saveStudents();
    renderTable();
    const editStudentModal = bootstrap.Modal.getInstance(document.getElementById('editStudentModal'));
    editStudentModal.hide();
});

function saveStudents() {
    localStorage.setItem('students', JSON.stringify(students));
}

function exportToExcel() {
    const worksheet = XLSX.utils.json_to_sheet(students);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

    // Xuất file
    XLSX.writeFile(workbook, "danh_sach_hoc_sinh.xlsx");
}

document.getElementById('exportBtn').addEventListener('click', exportToExcel);


function importFromExcel(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Giả sử dữ liệu nằm ở sheet đầu tiên
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const importedData = XLSX.utils.sheet_to_json(firstSheet);

        // Cập nhật danh sách học sinh
        students = importedData;
        saveStudents();
        renderTable();
    };

    reader.readAsArrayBuffer(file);
}

document.getElementById('importBtn').addEventListener('change', importFromExcel);


// // Render bảng ban đầu
renderTable();


