This is a webapp for tracking research conference deadlines.

## Development

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Adding and Updating Conferences

Conference data is stored in YAML files within the [`data/conferences`](https://github.com/limoiie/ddls/tree/main/data/conferences) directory,
which is directly copied from [`ccfddl/ccf-deadlines`](https://github.com/ccfddl/ccf-deadlines.git).
The structure is organized as follows:

- [`data/conferences/types.yml`](https://github.com/limoiie/ddls/tree/main/data/conferences/types.yml) - Contains official conference categories
- [`data/conferences/custom-types.yml`](https://github.com/limoiie/ddls/tree/main/data/conferences/custom-types.yml) - Contains custom conference categories relevant to our lab
- [`data/conferences/**`](https://github.com/limoiie/ddls/tree/main/data/conferences) - Contains individual conference configurations

To add a new conference, create a `.yml` file in the appropriate subdirectory under [`data/conferences/**`](https://github.com/limoiie/ddls/tree/main/data/conferences) with the following structure:

```yaml
- title: ACCV
  description: Asian Conference on Computer Vision
  sub: AI
  rank:
    ccf: C
    core: B
    thcpl: N
  dblp: accv
  confs:
    - year: 2024
      id: accv24
      link: https://accv2024.org/
      timeline:
        - deadline: "2024-07-02 23:59:59"
      timezone: UTC-12
      date: December 8-12, 2024
      place: Hanoi, Vietnam
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
