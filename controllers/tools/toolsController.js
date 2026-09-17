export function createTempMailController({ tempMailService }) {
  return {
    async handleCreateEmail(req, res) {
      try {
        const data = await tempMailService.createEmail();
        return res.json({ status: 'success', data });
      } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
      }
    },

    async handleGetMessages(req, res) {
      try {
        const email = req.query.email || req.body?.email;
        const password = req.query.password || req.body?.password;

        if (!email || !password) {
          return res.status(400).json({ status: 'error', message: 'Parameter "email" dan "password" wajib diisi' });
        }

        const messages = await tempMailService.getMessages(email, password);
        return res.json({ status: 'success', total: messages.length, data: messages });
      } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
      }
    },

    async handleReadMessage(req, res) {
      try {
        const email = req.query.email || req.body?.email;
        const password = req.query.password || req.body?.password;
        const id = req.params.id || req.query.id || req.body?.id;

        if (!email || !password || !id) {
          return res.status(400).json({ status: 'error', message: 'Parameter "email", "password", dan message "id" wajib diisi' });
        }

        const data = await tempMailService.readMessage(email, password, id);
        return res.json({ status: 'success', data });
      } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
      }
    },
  };
}

export function createUploadController({ uploadService }) {
  return {
    async handleUpload(req, res) {
      try {
        if (!req.file) {
          return res.status(400).json({ status: 'error', message: 'File wajib diunggah (form-data: "file")' });
        }
        const data = await uploadService.uploadFile(req.file);
        return res.json({ status: 'success', data });
      } catch (err) {
        return res.status(500).json({ status: 'error', message: err.message });
      }
    },
  };
}
