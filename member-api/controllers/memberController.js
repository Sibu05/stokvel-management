const { Member } = require('../storage/data');

exports.getOne = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.status(200).json(member);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { email, groupId } = req.body;

    if (!email || !groupId) {
      return res.status(400).json({ error: 'email and groupId are required' });
    }

    const member = await Member.create({
      email,
      groupId,
      status: 'active',
      joinedAt: new Date(),
    });

    res.status(201).json(member);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    // only the member themselves can update their membership
    if (member.email !== req.auth.sub) {
      return res.status(403).json({ error: 'Forbidden — not your membership' });
    }

    await member.update(req.body);
    res.status(200).json(member);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    // only the member themselves can remove their membership
    if (member.email !== req.auth.sub) {
      return res.status(403).json({ error: 'Forbidden — not your membership' });
    }

    await member.destroy();
    res.status(204).send();

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
