const { User } = require('../storage/data');

exports.getOne = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'firstName, lastName and email are required' });
    }

    // store the Auth0 sub so we can verify ownership later
    const user = await User.create({
      firstName,
      lastName,
      email,
      authId: req.auth.sub,
    });

    res.status(201).json(user);

  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // only the account owner can update
    if (user.authId !== req.auth.sub) {
      return res.status(403).json({ error: 'Forbidden - account mismatch' });
    }

    await user.update(req.body);
    res.status(200).json(user);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // only the account owner can delete
    if (user.authId !== req.auth.sub) {
      return res.status(403).json({ error: 'Forbidden - account mismatch' });
    }

    await user.destroy();
    res.status(204).send();

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
