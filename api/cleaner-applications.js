const { env, getApplications, saveApplications, json } = require('./_telegram');

const cleanText = value => String(value || '').trim();
const isAdmin = req => {
  const configured = env('ADMIN_APPLICATIONS_KEY');
  return req.headers['x-admin-applications-key'] === configured;
};

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      if (!isAdmin(req)) return json(res, 401, { ok: false, error: 'Administrator access required' });
      return json(res, 200, { ok: true, applications: await getApplications() });
    }
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed' });

    const { action } = req.body || {};
    const applications = await getApplications();
    if (action === 'approve') {
      if (!isAdmin(req)) return json(res, 401, { ok: false, error: 'Administrator access required' });
      const application = applications.find(item => item.id === cleanText(req.body.id));
      if (!application) return json(res, 404, { ok: false, error: 'Application not found' });
      application.status = 'approved';
      application.rate = Number(req.body.rate) || 0;
      application.approvedAt = new Date().toISOString();
      await saveApplications(applications);
      return json(res, 200, { ok: true, application });
    }

    const name = cleanText(req.body.name);
    const phone = cleanText(req.body.phone);
    const abn = cleanText(req.body.abn);
    const availability = req.body.availability || {};
    if (!name || !phone || !abn || !Object.keys(availability).length) return json(res, 400, { ok: false, error: 'Name, phone, ABN and availability are required' });
    const application = { id: `cleaner_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, name, phone, abn, availability, status: 'pending', createdAt: new Date().toISOString() };
    applications.unshift(application);
    await saveApplications(applications);
    return json(res, 201, { ok: true, application });
  } catch (error) {
    return json(res, 500, { ok: false, error: error.message });
  }
};
