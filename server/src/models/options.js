// Options communes : dates automatiques + « id » propre dans le JSON renvoyé
export const schemaOptions = {
  timestamps: true,
  toJSON: {
    versionKey: false,
    transform(_doc, ret) {
      ret.id = ret._id.toString()
      delete ret._id
      return ret
    },
  },
}

// Les listes affichées sur le site sont triées par ce champ
export const orderField = { type: Number, default: 0, index: true }
