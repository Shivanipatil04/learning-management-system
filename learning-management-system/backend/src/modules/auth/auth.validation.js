const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const validatePhone = (phone) => 
{
    if (!phone) return "phone number is required";
    if (!PHONE_REGEX.test(phone)) return "Enter a valid 10-digit phone number";
    return null;
};

const validatePassword = (password) =>
{
    if (!password) return "Password is required";
    if (!PASSWORD_REGEX.test(password)) 
    {

        return "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character";
    }
    return null;
};

const validateName = (name) =>
{
    if (!name || name.trim() === "") return "Name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters long";
    return null;
}

const runValidators = (checks) =>
{
    for (const [value, validateFn] of checks)
    {
        const error = validateFn(value);
        if(error) return error;
    }
    return null;
}
const validateEmail = (email) => {
  if (!email) return "Email is required";
  if (!EMAIL_REGEX.test(email)) return "Enter a valid email address";
  return null;
};
const validateSignup = (req, res, next) =>
{
    const { name, email, phone, password } = req.body;

    const error = runValidators([
        [name, validateName],
        [email, validateEmail],
        [phone, validatePhone],
        [password, validatePassword]
    ])
    if (error)
    {
        return res.status(400).json({success: false, message: error});

    }
    next();
};
const validateLogin = (req, res, next) =>
{
    const { email, password} = req.body;

    const error = runValidators([
        [email, validateEmail],
        [password, (val) => (!val ? "password is required" : null)] 

    ]) ;
    if (error) 
    {
        return res.status(400).json({success: false, message: error});
 
}
next();
};

module.exports = { validateSignup, validateLogin };