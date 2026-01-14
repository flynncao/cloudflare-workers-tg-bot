import { getModelForClass, prop } from '@typegoose/typegoose'

export interface IPost {
  id: number
  title: string
  content: string
  author: string
  created_at: Date | null
  updated_at: Date | null
}

export class Post {
  @prop({ required: true, unique: true, index: true })
  public id!: number

  @prop({ required: true })
  public title!: string

  @prop({ required: false, default: '' })
  public content!: string

  @prop({ required: false, default: '' })
  public author!: string

  @prop({ required: false, default: () => new Date() })
  public created_at!: Date

  @prop({ required: false, default: null })
  public updated_at?: Date
}

const PostModel = getModelForClass(Post)

// TODO: Use menu to operate database
interface Brief {
  title: string
  content: string
}

export function createNewPost(id: number, title: string, content: string, author: string = 'Flynn Cao', created_at?: Date) {
  if (!created_at)
    created_at = new Date()
  return PostModel.create({
    id,
    title,
    content,
    author,
    created_at,
  })
}

export function getAllPosts() {
  return PostModel.find({})
}
export function findOrCreateUser(id: number, brief?: Brief) {
  return PostModel.findOneAndUpdate(
    // filter
    { id },
    // update
    {
      title: brief?.title,
      content: brief?.content,
    },
    // config
    {
      upsert: true,
      new: true,
    },
  )
}
export function editPost(id: number, content: string, updated_at?: Date) {
  if (!updated_at)
    updated_at = new Date()
  return PostModel.findOneAndUpdate(
    { id },
    { content, updated_at },
    {
      upsert: true,
      new: true,
    },
  )
}
