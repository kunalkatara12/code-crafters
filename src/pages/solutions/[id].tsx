import { type GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { Fa6SolidArrowUpRightFromSquare, Upvote } from "~/components/Icones";
import { prisma } from "~/server/db";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { api } from "~/utils/api";
import { timeAgo } from "~/utils/helpers";

const SolutionPage = ({ id }: { id: string }) => {
  const { data: solution } = api.solution.getById.useQuery(
    { id: id || "" },
    {
      onError: (err) => {
        console.log("error", err);
      },
    }
  );
  if (!solution) return <div>loading...</div>;
  const image = solution.challenge.imagesURL[0];

  const title = `Code Crafters | ${solution.title || ""}`;
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <main className="relative max-w-full  ">
        <article
          style={{
            backgroundImage: `url(${image || ""})`,
          }}
          className="relative left-[calc(-50vw+50%)] w-screen px-4 bg-gray-900/80  bg-cover bg-center bg-no-repeat bg-blend-multiply "
        >
          <div className=" mx-auto  max-w-6xl  py-8 text-gray-100 ">
            <div className="mx-auto flex max-w-4xl flex-col items-center py-12 ">
              <p>Submitted about {timeAgo(solution?.createdAt)}</p>
              <h1 className="my-3 text-3xl font-semibold tracking-wider ">
                {solution.title}
              </h1>
              <div className="my-2 flex flex-row items-center space-x-3 ">
                <Link
                  className="group"
                  href={`/profile/${solution.user.username}`}
                >
                  <Image
                    src={solution.user.image}
                    width={50}
                    height={50}
                    alt={"user-avatar"}
                    className="rounded-full"
                  />
                </Link>
                <div className="flex flex-col items-start gap-y-0.5">
                  <Link
                    className="group"
                    href={`/profile/${solution.user.username}`}
                  >
                    <p className="font-semibold hover:underline  ">
                      {solution.user.name}
                    </p>
                  </Link>
                  <p className="text-sm text-gray-300">
                    @{solution.user.username}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-row justify-between">
              <div className="flex flex-row items-center space-x-3">
                {solution.liveURL && (
                  <Link
                    target="_blank"
                    href={solution.liveURL}
                    className="flex flex-row items-center gap-2 rounded-full bg-red-500 px-5 py-2 text-lg font-semibold uppercase text-white duration-150 hover:brightness-90 "
                  >
                    Preview
                    <Fa6SolidArrowUpRightFromSquare fontSize={14} />
                  </Link>
                )}
                <Link
                  target="_blank"
                  href={`${solution.repoURL}`}
                  className="flex items-center gap-2  rounded-full bg-gray-100 px-5 py-2 text-lg font-semibold uppercase text-gray-800 duration-150 hover:brightness-90 "
                >
                  View Code
                  <Fa6SolidArrowUpRightFromSquare fontSize={14} />
                </Link>
              </div>
              <div className="flex flex-row items-center space-x-3">
                <button className="flex items-center gap-2  rounded-full bg-gray-100 px-5 py-2 text-lg font-semibold uppercase text-gray-800 duration-150 hover:brightness-90 ">
                  <Upvote />
                  {solution._count.likes}
                </button>
              </div>
            </div>
          </div>
        </article>
        <Challenge
          image={image}
          title={solution.challenge.title}
          slug={solution.challenge.slug}
          difficulty={solution.challenge.difficulty}
          type={solution.challenge.type}
        />
      </main>
    </>
  );
};

export default SolutionPage;

export async function getStaticPaths() {
  const solutions = await prisma.solution.findMany({
    select: {
      id: true,
    },
  });
  return {
    paths: solutions.map((solution) => ({
      params: { id: solution.id },
    })),
    fallback: "blocking", // can also be true or 'blocking'
  };
}

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();
  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("no solution id");

  await ssg.solution.getById.prefetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id: id,
    },
  };
};

const Challenge = ({
  image,
  title,
  difficulty,
  type,
  slug,
}: {
  image?: string;
  title: string;
  difficulty: string;
  type: string;
  slug: string;
}) => {
  return (
    <div
      style={{
        clipPath: "inset(0 -100vmax)",
      }}
      className="flex border-b items-center justify-between bg-white px-3 py-5 shadow-[0_0_0_100vmax] shadow-white"
    >
      <div className="flex items-center">
        {image && (
          <Image
            className={"mr-3 h-24 w-36"}
            src={image}
            width={150}
            height={100}
            alt="solution-image"
          />
        )}
        <div className="flex flex-col items-start gap-1">
          <p>This is a solution for...</p>
          <Link href={`/challenges/${slug}`} className="text-lg font-medium hover:underline " >{title}</Link>
          <div className="flex items-center gap-3">
            <p className='uppercase text-green-500 ' >{type}</p>
            <p className='uppercase text-red-500 ' >{difficulty}</p>
          </div>
        </div>
      </div>
      <Link className="items-center gap-2 hidden md:flex  rounded-full text-white bg-blue-600 px-5 py-2 text-lg font-semibold uppercase text-gray-800 duration-150 hover:brightness-90 " href={`/challenges/${slug}`}>View Challenge</Link>
    </div>
  );
};
