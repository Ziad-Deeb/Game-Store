const chechPermissions = (requestUser, resourceUserId) => {
    if (requestUser.role === 'administrator') return;
    if (requestUser.role === 'manager') return;
    if (requestUser._id.toString() === resourceUserId.toString()) return;
    const error = new Error('Not authorized to access this route');
    error.statusCode = 401;
    throw error;
};

module.exports = chechPermissions;
