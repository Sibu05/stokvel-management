const { Group, Member } = require('../storage/data');

exports.getOne = async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id, {
      include: [Member],
    });
    if (!group) return res.status(404).json({ error: 'Group not found' });
    res.status(200).json(group);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description, cycleType, startDate } = req.body;

    if (!name || !cycleType || !startDate) {
      return res.status(400).json({ error: 'name, cycleType and startDate are required' });
    }

    const group = await Group.create({
      name,
      description: description || null,
      cycleType,
      startDate,
    });

    res.status(201).json(group);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    // must be an active member to update the group
    const isMember = await Member.findOne({
      where: { groupId: group.id, status: 'active' },
    });
    if (!isMember) {
      return res.status(403).json({ error: 'Forbidden — not a member of this group' });
    }

    await group.update(req.body);
    res.status(200).json(group);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    // must be an active member to delete the group
    const isMember = await Member.findOne({
      where: { groupId: group.id, status: 'active' },
    });
    if (!isMember) {
      return res.status(403).json({ error: 'Forbidden — not a member of this group' });
    }

    await group.destroy();
    res.status(204).send();

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
