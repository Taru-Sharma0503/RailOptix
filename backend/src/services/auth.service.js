const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const userRepo = require('../repositories/user.repository');
const deptRepo = require('../repositories/department.repository');
const { ConflictError, UnauthorizedError, NotFoundError } = require('../utils/errors');
const { generateId } = require('../utils/helpers');

class AuthService {
  async register({ name, email, password, role, departmentId }) {
    const existing = await userRepo.findByEmail(email);
    if (existing) {
      throw new ConflictError('User with this email already exists');
    }

    if (departmentId) {
      const dept = await deptRepo.findById(departmentId);
      if (!dept) throw new NotFoundError('Department not found');
    }

    const count = await userRepo.count();
    const id = generateId('USR', count + 1);

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await userRepo.create({
      id,
      name,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      role: role || 'operator',
      department_id: departmentId || null,
    });

    const token = this._generateToken(user);
    return {
      success: true,
      message: 'User registered successfully',
      user: await userRepo.safeUser(user),
      token,
    };
  }

  async login({ email, password }) {
    const user = await userRepo.findByEmail(email.toLowerCase());
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = this._generateToken(user);
    return {
      success: true,
      token,
      user: await userRepo.safeUser(user),
    };
  }

  async me(userId) {
    const user = await userRepo.findById(userId);
    if (!user) throw new UnauthorizedError('User not found');
    return {
      success: true,
      user: await userRepo.safeUser(user),
    };
  }

  _generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, departmentId: user.department_id },
      env.jwtSecret,
      { expiresIn: '24h' }
    );
  }
}

module.exports = new AuthService();
