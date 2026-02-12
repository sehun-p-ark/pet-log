const openBtn = document.getElementById("openInquiryBtn");
const modal = document.getElementById("inquiryModal");
const closeBtn = document.getElementById("modalCloseBtn");
const cancelBtn = document.getElementById("modalCancelBtn");

openBtn.addEventListener("click", () => {
    modal.classList.add("active");
});

closeBtn.addEventListener("click", () => {
    modal.classList.remove("active");
});

cancelBtn.addEventListener("click", () => {
    modal.classList.remove("active");
});

modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.classList.remove("active");
    }
});

const listBtn = document.querySelector('.secondary');
const listSection = document.getElementById('inquiryListSection');
const inquiryCloseBtn = document.getElementById('closeInquiryList');

listBtn.addEventListener('click', () => {
    listSection.classList.add('active');
});

inquiryCloseBtn.addEventListener('click', () => {
    listSection.classList.remove('active');
});
