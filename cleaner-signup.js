const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const grid = document.querySelector('#availabilityGrid');
grid.innerHTML = days.map(day => `<label class="day-row"><input type="checkbox" data-day="${day}" /><b>${day}</b><input type="time" data-start="${day}" value="07:00" disabled /><span>to</span><input type="time" data-end="${day}" value="15:00" disabled /></label>`).join('');
grid.querySelectorAll('input[type="checkbox"]').forEach(box => box.addEventListener('change', () => box.closest('.day-row').querySelectorAll('input[type="time"]').forEach(input => { input.disabled = !box.checked; })));
document.querySelector('#cleanerSignupForm').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const availability = {};
  grid.querySelectorAll('input[type="checkbox"]:checked').forEach(box => {
    const day = box.dataset.day;
    availability[day] = [grid.querySelector(`[data-start="${day}"]`).value, grid.querySelector(`[data-end="${day}"]`).value];
  });
  const message = document.querySelector('#formMessage');
  if (!Object.keys(availability).length) { message.textContent = 'Please select at least one available day.'; message.className = 'form-message error'; return; }
  const payload = Object.fromEntries(new FormData(form)); payload.availability = availability;
  const button = form.querySelector('button[type="submit"]'); button.disabled = true; button.textContent = 'Submitting…';
  try {
    const response = await fetch('/api/cleaner-applications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || 'Unable to submit your registration.');
    form.reset(); grid.querySelectorAll('input[type="time"]').forEach(input => { input.disabled = true; input.value = input.dataset.start ? '07:00' : '15:00'; });
    message.textContent = 'Thank you. Your registration was sent to the manager for review.'; message.className = 'form-message success';
  } catch (error) { message.textContent = error.message; message.className = 'form-message error'; }
  finally { button.disabled = false; button.textContent = 'Submit registration'; }
});
