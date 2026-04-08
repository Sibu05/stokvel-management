const { Contribution, Member } = require('../storage/data');

exports.getOne = async (req, res) => {
  try {
    const contribution = await Contribution.findByPk(req.params.id);
    if (!contribution) return res.status(404).json({ error: 'Contribution not found' });
    res.status(200).json(contribution);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { groupId, cycleNumber, amount } = req.body;

    if (!groupId || !cycleNumber || !amount) {
      return res.status(400).json({ error: 'groupId, cycleNumber and amount are required' });
    }

    // must be an active member of the group to create a contribution
    const isMember = await Member.findOne({
      where: { groupId, status: 'active' },
    });
    if (!isMember) {
      return res.status(403).json({ error: 'Forbidden — not an active member of this group' });
    }

    const contribution = await Contribution.create({
      groupId,
      userId: req.params.id, // the user creating the contribution
      cycleNumber,
      amount,
      status: 'outstanding',
    });

    res.status(201).json(contribution);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const contribution = await Contribution.findByPk(req.params.id);
    if (!contribution) return res.status(404).json({ error: 'Contribution not found' });

    // only the owner of the contribution can update it
    if (contribution.userId !== Number(req.params.id)) {
      return res.status(403).json({ error: 'Forbidden — not your contribution' });
    }

    // if marking as paid, automatically set paidAt timestamp
    if (req.body.status === 'paid' && contribution.status !== 'paid') {
      req.body.paidAt = new Date();
    }

    await contribution.update(req.body);
    res.status(200).json(contribution);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const contribution = await Contribution.findByPk(req.params.id);
    if (!contribution) return res.status(404).json({ error: 'Contribution not found' });

    // only the owner can delete their contribution
    if (contribution.userId !== Number(req.params.id)) {
      return res.status(403).json({ error: 'Forbidden — not your contribution' });
    }

    await contribution.destroy();
    res.status(204).send();

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
