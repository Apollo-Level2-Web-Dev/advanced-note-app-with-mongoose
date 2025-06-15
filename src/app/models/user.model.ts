import bcrypt from "bcryptjs";
import { model, Schema } from "mongoose";
import validator from "validator";
import { IAddress, IUser, UserInstanceMethods, UserStaticMethods } from "../interfaces/user.interface";
import { Note } from "./notes.model";


const addressSchema = new Schema<IAddress>({
    city: { type: String },
    street: { type: String },
    zip: { type: Number }
}, {
    _id: false
})

const userSchema = new Schema<IUser, UserStaticMethods, UserInstanceMethods>({
    firstName: {
        type: String,
        required: [true, "firstName keno dao nai?"],
        trim: true,
        minlength: [3, "First Name must be atleast 3 characters, got {VALUE}"],
        maxlength: 10

    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, "Name must be 3 characters"],
        maxlength: 10
    },
    age: {
        type: Number,
        required: true,
        min: [18, 'Age Must be at least 18, got {VALUE}'],
        // min: 18,
        max: 60,
    },
    email: {
        type: String,
        unique: [true, "Email common hoye geche!!"],
        required: true,
        lowercase: true,
        trim: true,
        // validate: {
        //     validator: function (value) {
        //         return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        //     },
        //     message: function (props) {
        //         return `Email ${props.value} is not valid email`
        //     }
        // }
        validate: [validator.isEmail, "Invalid Email sent {VALUE}"]
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        uppercase: true,
        enum: {
            values: ['USER', 'ADMIN', 'SUPERADMIN'],
            message: "Role is not valid. got {VALUE} role"
        },
        default: 'USER'
    },
    address: {
        type: addressSchema
    },
}, {
    versionKey: false,
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})




userSchema.method("hashPassword", async function (plainPassword: string) {
    const password = await bcrypt.hash(plainPassword, 10)
    return password
})
userSchema.static("hashPassword", async function (plainPassword: string) {
    const password = await bcrypt.hash(plainPassword, 10)
    return password
})

// Pre Hooks

// Document Middleware

userSchema.pre("save", async function (next) {
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

//Query Middlware

userSchema.pre("find", function (next) {
    console.log("Inside pre find hook");
    next()
})


//Post Hook

//Document Middlware
userSchema.post('save', function (doc, next) {
    console.log(`${doc.email} has been saved`);
    next()
});

//Query Middlware 
userSchema.post("findOneAndDelete", async function (doc, next) {
    if (doc) {
        console.log(doc);
        await Note.deleteMany({ user: doc._id })
    }

    next()
})

userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`
})


export const User = model<IUser, UserStaticMethods>("User", userSchema)