const { sql, getPool } = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
    // Tạo user mới
    static async create(userData) {
        try {
            const pool = await getPool();
            const request = pool.request();
            
            // Hash password
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            
            // Insert user
            const result = await request
                .input('username', userData.username)
                .input('email', userData.email)
                .input('password', hashedPassword)
                .input('firstName', userData.firstName)
                .input('lastName', userData.lastName)
                .input('phone', userData.phone)
                .input('address', userData.address || null)
                .input('dateOfBirth', userData.dateOfBirth || null)
                .input('gender', userData.gender || null)
                .input('role', userData.role || 'customer')
                .input('isActive', true)
                .query(`
                    INSERT INTO Users (Username, email, PasswordHash, firstName, lastName, phone, address, dateOfBirth, gender, role, IsActive, CreatedAt)
                    OUTPUT INSERTED.UserId as id, INSERTED.Username as username, INSERTED.email as email, INSERTED.firstName as firstName, INSERTED.lastName as lastName, INSERTED.role as role
                    VALUES (@username, @email, @password, @firstName, @lastName, @phone, @address, @dateOfBirth, @gender, @role, @isActive, GETDATE())
                `);
            
            return result.recordset[0];
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    // Tìm user theo email hoặc username
    static async findByEmailOrUsername(identifier) {
        try {
            const pool = await getPool();
            const request = pool.request();
            
            const result = await request
                .input('identifier', identifier)
                .query(`
                    SELECT UserId as id, Username as username, email, PasswordHash as password, firstName, lastName, phone, address, dateOfBirth, gender, role, IsActive as isActive, CreatedAt as createdAt
                    FROM Users 
                    WHERE (email = @identifier OR Username = @identifier) AND IsActive = 1
                `);
            
            return result.recordset[0] || null;
        } catch (error) {
            console.error('Error finding user:', error);
            throw error;
        }
    }

    // Tìm user theo ID
    static async findById(id) {
        try {
            const pool = await getPool();
            const request = pool.request();
            
            const result = await request
                .input('id', id)
                .query(`
                    SELECT UserId as id, Username as username, email, firstName, lastName, phone, address, dateOfBirth, gender, role, IsActive as isActive, CreatedAt as createdAt
                    FROM Users 
                    WHERE UserId = @id AND IsActive = 1
                `);
            
            return result.recordset[0] || null;
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    }

    // Xác thực password
    static async validatePassword(plainPassword, hashedPassword) {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            console.error('Error validating password:', error);
            throw error;
        }
    }

    // Cập nhật thông tin user
    static async update(id, updateData) {
        try {
            const pool = await getPool();
            const request = pool.request();
            
            let updateFields = [];
            let query = 'UPDATE Users SET ';
            
            if (updateData.firstName) {
                updateFields.push('firstName = @firstName');
                request.input('firstName', updateData.firstName);
            }
            if (updateData.lastName) {
                updateFields.push('lastName = @lastName');
                request.input('lastName', updateData.lastName);
            }
            if (updateData.phone) {
                updateFields.push('phone = @phone');
                request.input('phone', updateData.phone);
            }
            if (updateData.address !== undefined) {
                updateFields.push('address = @address');
                request.input('address', updateData.address);
            }
            if (updateData.dateOfBirth) {
                updateFields.push('dateOfBirth = @dateOfBirth');
                request.input('dateOfBirth', updateData.dateOfBirth);
            }
            if (updateData.gender) {
                updateFields.push('gender = @gender');
                request.input('gender', updateData.gender);
            }
            
            if (updateFields.length === 0) {
                throw new Error('No fields to update');
            }
            
            query += updateFields.join(', ') + ', UpdatedAt = GETDATE() WHERE UserId = @id';
            request.input('id', id);
            
            await request.query(query);
            
            return await this.findById(id);
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    // Đổi mật khẩu
    static async changePassword(id, newPassword) {
        try {
            const pool = await getPool();
            const request = pool.request();
            
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            await request
                .input('id', id)
                .input('password', hashedPassword)
                .query('UPDATE Users SET PasswordHash = @password, UpdatedAt = GETDATE() WHERE UserId = @id');
            
            return true;
        } catch (error) {
            console.error('Error changing password:', error);
            throw error;
        }
    }

    // Lấy danh sách users (admin only)
    static async getAll(limit = 50, offset = 0) {
        try {
            const pool = await getPool();
            const request = pool.request();
            
            const result = await request
                .input('limit', limit)
                .input('offset', offset)
                .query(`
                    SELECT UserId as id, Username as username, email, firstName, lastName, phone, role, IsActive as isActive, CreatedAt as createdAt
                    FROM Users 
                    ORDER BY CreatedAt DESC
                    OFFSET @offset ROWS
                    FETCH NEXT @limit ROWS ONLY
                `);
            
            return result.recordset;
        } catch (error) {
            console.error('Error getting all users:', error);
            throw error;
        }
    }

    // Đếm tổng số users
    static async count() {
        try {
            const pool = await getPool();
            const request = pool.request();
            
            const result = await request.query('SELECT COUNT(*) as total FROM Users WHERE IsActive = 1');
            return result.recordset[0].total;
        } catch (error) {
            console.error('Error counting users:', error);
            throw error;
        }
    }

    // Xóa user (soft delete)
    static async delete(id) {
        try {
            const pool = await getPool();
            const request = pool.request();
            
            await request
                .input('id', id)
                .query('UPDATE Users SET IsActive = 0, UpdatedAt = GETDATE() WHERE UserId = @id');
            
            return true;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    // Kiểm tra email/username đã tồn tại
    static async exists(identifier) {
        try {
            const pool = await getPool();
            const request = pool.request();
            
            const result = await request
                .input('identifier', identifier)
                .query(`
                    SELECT COUNT(*) as count 
                    FROM Users 
                    WHERE (email = @identifier OR Username = @identifier) AND IsActive = 1
                `);
            
            return result.recordset[0].count > 0;
        } catch (error) {
            console.error('Error checking user existence:', error);
            throw error;
        }
    }
}

module.exports = User;
