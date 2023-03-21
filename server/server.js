import fastify from "fastify";
import dotenv from "dotenv";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import sensible from "@fastify/sensible";
import { PrismaClient } from "@prisma/client";
dotenv.config();

const app = fastify();

app.register(sensible);
app.register(cookie, { secret: process.env.COOKIE_SECRET });
app.register(cors, {
  origin: process.env.CLIENT_URL,
  credentials: true,
});

// This hook: everytime we make a request, it's going to set the cookie on our browser to the user id of this current user, so we have the same information on our server and browser
// basically allows us to fake that we're logged in as a specific user without actually having to write user auth code
app.addHook("onRequest", (req, res, done) => {
  if (req.cookies.userId !== CURRENT_USER_ID) {
    req.cookies.userId = CURRENT_USER_ID;
    res.clearCookie("userId");
    res.setCookie("userId", CURRENT_USER_ID);
  }
  done();
});

const prisma = new PrismaClient();

// getting the first user with the "Zach", getting this specific user's id, and setting this user id to CURRENT_USER_ID
const CURRENT_USER_ID =
  // this line determines the user. Change "name" to switch user
  (await prisma.user.findFirst({ where: { name: "Zach" } })).id;

const COMMENT_SELECT_FIELDS = {
  id: true,
  message: true,
  parentId: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      name: true,
    },
  },
};

/////////////////// GET ALL POSTS HANDLER ///////////////////

app.get("/posts", async (req, res) => {
  return await commitToDb(
    prisma.post.findMany({
      select: {
        id: true,
        title: true,
      },
    })
  );
});

/////////////////// GET SINGLE POSTS HANDLER ///////////////////

app.get("/posts/:id", async (req, res) => {
  return await commitToDb(
    prisma.post
      .findUnique({
        where: { id: req.params.id },
        select: {
          body: true,
          title: true,
          comments: {
            orderBy: {
              createdAt: "desc",
            },
            select: {
              ...COMMENT_SELECT_FIELDS,
              _count: { select: { likes: true } },
            },
          },
        },
      })
      .then(async (post) => {
        const likes = await prisma.like.findMany({
          where: {
            userId: req.cookies.userId,
            commentId: { in: post.comments.map((comment) => comment.id) },
          },
        });

        return {
          ...post,
          comments: post.comments.map((comment) => {
            const { _count, ...commentFields } = comment;
            return {
              ...commentFields,
              likedByMe: likes.find((like) => like.commentId === comment.id),
              likeCount: _count.likes,
            };
          }),
        };
      })
  );
});

/////////////////// CREATE COMMENT HANDLER ///////////////////

app.post("/posts/:id/comments", async (req, res) => {
  if (req.body.message === "" || req.body.message == null) {
    return res.send(app.httpErrors.badRequest("Message is required"));
  }

  return await commitToDb(
    prisma.comment
      .create({
        data: {
          message: req.body.message,
          userId: req.cookies.userId,
          parentId: req.body.parentId,
          postId: req.params.id,
        },
        select: COMMENT_SELECT_FIELDS,
      })
      .then((comment) => {
        return {
          ...comment,
          likeCount: 0,
          likedByMe: false,
        };
      })
  );
});

/////////////////// EDIT HANDLER ///////////////////

app.put("/posts/:postId/comments/:commentId", async (req, res) => {
  // error check: message required
  if (req.body.message === "" || req.body.message == null) {
    return res.send(app.httpErrors.badRequest("Message is required"));
  }

  // error check: user trying to edit comment matches the comment creator
  // only the creator of the comment should be able to edit the comment
  // get userId for the current comment:
  const { userId } = await prisma.comment.findUnique({
    where: { id: req.params.commentId },
    select: { userId: true },
  });

  // if userId does not match the userId saved in the cookies, send error message
  if (userId !== req.cookies.userId) {
    return res.send(
      app.httpErrors.unauthorized(
        "You do not have permission to edit this message"
      )
    );
  }

  return await commitToDb(
    prisma.comment.update({
      where: { id: req.params.commentId },
      data: { message: req.body.message },
      select: { message: true },
    })
  );
});

/////////////////// DELETE HANDLER ///////////////////

app.delete("/posts/:postId/comments/:commentId", async (req, res) => {
  const { userId } = await prisma.comment.findUnique({
    where: { id: req.params.commentId },
    select: { userId: true },
  });
  if (userId !== req.cookies.userId) {
    return res.send(
      app.httpErrors.unauthorized(
        "You do not have permission to delete this message"
      )
    );
  }

  return await commitToDb(
    prisma.comment.delete({
      where: { id: req.params.commentId },
      select: { id: true },
    })
  );
});

///////////////////

app.post("/posts/:postId/comments/:commentId/toggleLike", async (req, res) => {
  const data = {
    commentId: req.params.commentId,
    userId: req.cookies.userId,
  };

  const like = await prisma.like.findUnique({
    where: { userId_commentId: data },
  });

  if (like == null) {
    return await commitToDb(prisma.like.create({ data })).then(() => {
      return { addLike: true };
    });
  } else {
    return await commitToDb(
      prisma.like.delete({ where: { userId_commentId: data } })
    ).then(() => {
      return { addLike: false };
    });
  }
});

/////////////////// CREATE POST HANDLER ///////////////////

///////////////////

// Helper function to handle errors
async function commitToDb(promise) {
  // "to" method from sensible library takes in a promise and returns either an error or result (data)
  const [error, data] = await app.to(promise);
  // httpErrors from sensible library
  if (error) return app.httpErrors.internalServerError(error.message);
  return data;
}

app.listen({ port: process.env.PORT });
