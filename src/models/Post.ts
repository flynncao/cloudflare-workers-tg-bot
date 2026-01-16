import { getModelForClass, prop } from '@typegoose/typegoose'
import type { ReturnModelType } from '@typegoose/typegoose'

export interface IPost {
  id: number
  title: string
  content: string
  author: string
  created_at: Date | null
  updated_at: Date | null
}

export class Post {
  @prop({ required: true, unique: true, index: true, type: () => Number })
  public id!: number

  @prop({ required: true, type: () => String })
  public title!: string

  @prop({ required: false, default: '', type: () => String })
  public content!: string

  @prop({ required: false, default: '', type: () => String })
  public author!: string

  @prop({ required: false, default: () => new Date(), type: () => Date })
  public created_at!: Date

  @prop({ required: false, default: null, type: () => Date })
  public updated_at?: Date
}

// Lazy-load the model to avoid initialization issues in Workers
let PostModel: ReturnModelType<typeof Post> | null = null

function getPostModel() {
  if (!PostModel)
    PostModel = getModelForClass(Post)

  return PostModel
}

// TODO: Use menu to operate database
interface Brief {
  title: string
  content: string
}

export function createNewPost(id: number, title: string, content: string, author: string = 'Flynn Cao', created_at?: Date) {
  if (!created_at)
    created_at = new Date()
  return getPostModel().create({
    id,
    title,
    content,
    author,
    created_at,
  })
}

export function getAllPosts() {
  return getPostModel().find({})
}
export function findOrCreateUser(id: number, brief?: Brief) {
  return getPostModel().findOneAndUpdate(
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
  return getPostModel().findOneAndUpdate(
    { id },
    { content, updated_at },
    {
      upsert: true,
      new: true,
    },
  )
}
