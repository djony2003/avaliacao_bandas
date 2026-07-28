(function () {
  const config = window.BANDA5_SUPABASE || {};
  const configured = Boolean(config.url && config.publishableKey && window.supabase?.createClient);
  const client = configured ? window.supabase.createClient(config.url, config.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  }) : null;

  const cleanFileName = name => name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "_");
  const requireClient = () => { if (!client) throw new Error("Supabase ainda nao foi configurado."); return client; };

  window.BandDB = {
    configured,
    client,

    async loadQuestionBank() {
      const { data, error } = await requireClient().from("question_banks").select("data, revision, updated_at").eq("id", 1).maybeSingle();
      if (error) throw error;
      return { sections: Array.isArray(data?.data) ? data.data : null, revision: data?.revision || null, updatedAt: data?.updated_at || null };
    },

    async loadAdminQuestionBank() {
      const { data, error } = await requireClient().rpc("get_admin_question_bank");
      if (error) throw error;
      return { sections: Array.isArray(data?.data) ? data.data : null, revision: data?.revision || null, updatedAt: data?.updated_at || null };
    },

    async saveQuestionBank(sections, expectedRevision) {
      const { data, error } = await requireClient().rpc("publish_question_bank", { p_data: sections, p_expected_revision: expectedRevision });
      if (error) throw error;
      return { revision: data.revision, updatedAt: data.updated_at };
    },

    async submitDiagnosis(payload) {
      const submissionId = payload.client_submission_id || crypto.randomUUID();
      const { data, error } = await requireClient().rpc("submit_diagnosis", {
        p_client_submission_id: submissionId,
        p_question_bank_revision: payload.question_bank_revision,
        p_participant: payload.participante,
        p_answers: payload.respostas,
        p_plan: payload.plano,
        p_assessment_version: payload.versao || "3.0"
      });
      if (error) throw error;
      return data || { id: submissionId };
    },

    async signIn(email, password) {
      const { data, error } = await requireClient().auth.signInWithPassword({ email, password });
      if (error) throw error;
      const admin = await this.isAdmin();
      if (!admin) { await client.auth.signOut(); throw new Error("Esta conta nao possui permissao de administrador."); }
      return data;
    },

    async signOut() { if (!client) return; const { error } = await client.auth.signOut({ scope:"local" }); if (error) throw error; },
    async getSession() { if (!client) return null; return (await client.auth.getSession()).data.session; },
    onAuthStateChange(callback) { if (!client) return null; return client.auth.onAuthStateChange(callback); },
    async sendPasswordReset(email) {
      const redirectTo = `${window.location.origin}${window.location.pathname}`;
      const { error } = await requireClient().auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
    },
    async updatePassword(password) {
      const { error } = await requireClient().auth.updateUser({ password });
      if (error) throw error;
    },
    async isAdmin() {
      if (!client) return false;
      const { data: { user } } = await client.auth.getUser();
      if (!user) return false;
      const { data, error } = await client.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
      if (error) throw error;
      return Boolean(data);
    },

    async listSubmissions() {
      const { data, error } = await requireClient().from("submissions").select("*").order("created_at", { ascending: false }).limit(500);
      if (error) throw error;
      return data || [];
    },

    async updateSubmissionStatus(id, status) {
      const { error } = await requireClient().from("submissions").update({ status }).eq("id", id);
      if (error) throw error;
    },

    async deleteSubmission(id) {
      const { error } = await requireClient().from("submissions").delete().eq("id", id);
      if (error) throw error;
    },

    async uploadAudio(file, questionId) {
      const extension = cleanFileName(file.name).split(".").pop() || "mp3";
      const contentType = file.type || ({ mp3:"audio/mpeg", wav:"audio/wav", m4a:"audio/mp4", ogg:"audio/ogg", aac:"audio/aac" })[extension.toLowerCase()] || "audio/mpeg";
      const path = `${cleanFileName(String(questionId))}/${Date.now()}.${extension}`;
      const { error } = await requireClient().storage.from("question-audio").upload(path, file, { contentType, upsert: false });
      if (error) throw error;
      const { data } = client.storage.from("question-audio").getPublicUrl(path);
      return { kind: "uploadedRemote", url: data.publicUrl, storagePath: path, uploadedName: file.name, mimeType: contentType };
    },

    async deleteAudio(path) {
      if (!path) return;
      const { error } = await requireClient().storage.from("question-audio").remove([path]);
      if (error) throw error;
    }
  };
})();
