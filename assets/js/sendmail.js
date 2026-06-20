document.addEventListener("DOMContentLoaded", () => {
const form = document.getElementById("pilotForm");

form.addEventListener("submit", async (e) => {
e.preventDefault();

const submitBtn = form.querySelector("button[type='submit']");
submitBtn.disabled = true;
submitBtn.innerText = "Submitting...";

const templateParams = {
  name: form.name.value,
  practice: form.practice.value,
  phone: form.phone.value,
  email: form.email.value,
  pms: form.pms.value,
};

try {
  await emailjs.send(
    "service_ihuyivp",
    "template_52tx08p",
    templateParams
  );

  form.reset();
  form.style.display = "none";
  document.getElementById("successMessage").style.display = "block";
} catch (error) {
  console.error(error);
  alert("Failed to send application.");
} finally {
  submitBtn.disabled = false;
  submitBtn.innerText = "Submit Application";
}

});
});
