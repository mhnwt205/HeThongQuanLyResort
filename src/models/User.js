const { sql, getPool } = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
    // Tạo user mới (phù hợp schema migration_fixed.sql)
    static async create(userData) {
        try {
            const pool = await getPool();

            // 1) Tạo bản ghi Customer lưu thông tin cá nhân và email
            const customerInsert = await pool.request()
                .input('CustomerCode', `${userData.username}`)
                .input('FirstName', userData.firstName)
                .input('LastName', userData.lastName)
                .input('Email', userData.email || null)
                .input('Phone', userData.phone || null)
                .input('Address', userData.address || null)
                .input('Nationality', null)
                .input('PassportNumber', null)
                .input('IdCardNumber', null)
                .input('DateOfBirth', userData.dateOfBirth || null)
                .input('Gender', userData.gender || null)
                .input('CustomerType', 'individual')
                .input('LoyaltyPoints', 0)
                .input('Notes', null)
                .query(`
                    INSERT INTO Customers (
                        CustomerCode, FirstName, LastName, Email, Phone, Address,
                        Nationality, PassportNumber, IdCardNumber, DateOfBirth,
                        Gender, CustomerType, LoyaltyPoints, Notes
                    ) VALUES (
                        @CustomerCode, @FirstName, @LastName, @Email, @Phone, @Address,
                        @Nationality, @PassportNumber, @IdCardNumber, @DateOfBirth,
                        @Gender, @CustomerType, @LoyaltyPoints, @Notes
                    );
                    SELECT SCOPE_IDENTITY() AS CustomerId;
                `);

            const customerId = customerInsert.recordset[0]?.CustomerId;

            // 2) Lấy RoleId từ bảng Roles theo role name
            const roleName = userData.role || 'customer';
            const roleRow = await pool.request()
                .input('RoleName', roleName)
                .query('SELECT TOP 1 RoleId FROM Roles WHERE RoleName = @RoleName');
            const roleId = roleRow.recordset[0]?.RoleId || null;

            // 3) Hash password và tạo Users
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const userInsert = await pool.request()
                .input('Username', userData.username)
                .input('PasswordHash', hashedPassword)
                .input('RoleId', roleId)
                .input('IsActive', true)
                .query(`
                    INSERT INTO Users (Username, PasswordHash, RoleId, IsActive, CreatedAt)
                    OUTPUT INSERTED.UserId, INSERTED.Username
                    VALUES (@Username, @PasswordHash, @RoleId, @IsActive, GETDATE());
                `);

            const created = userInsert.recordset[0];
            return {
                id: created.UserId,
                username: created.Username,
                email: userData.email || null,
                role: roleName,
                customerId: customerId || null
            };
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

            // Chỉ hỗ trợ đăng nhập bằng username theo schema hiện tại
            const result = await request
                .input('username', identifier)
                .query(`
                    SELECT 
                        UserId as id, 
                        Username as username, 
                        PasswordHash as password,
                        IsActive as isActive, 
                        CreatedAt as createdAt,
                        RoleId
                    FROM Users
                    WHERE Username = @username AND IsActive = 1
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
                .query('UPDATE Users SET password = @password, UpdatedAt = GETDATE() WHERE UserId = @id');
            
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

            // Nếu là email, kiểm tra ở bảng Customers
            if (typeof identifier === 'string' && identifier.includes('@')) {
                const emailCount = await pool.request()
                    .input('email', identifier)
                    .query('SELECT COUNT(*) as count FROM Customers WHERE Email = @email');
                return emailCount.recordset[0].count > 0;
            }

            // Ngược lại kiểm tra username ở bảng Users
            const userCount = await pool.request()
                .input('username', identifier)
                .query('SELECT COUNT(*) as count FROM Users WHERE Username = @username');
            return userCount.recordset[0].count > 0;
        } catch (error) {
            console.error('Error checking user existence:', error);
            throw error;
        }
    }
}

module.exports = User;
