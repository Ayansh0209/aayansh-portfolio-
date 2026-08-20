# Project screenshots

Drop a screenshot in here, then point at it from `lib/content.ts`:

```ts
{
  index: "01",
  name: "CodeMap AI",
  ...
  image: "/work/codemap.jpg",   // <- add this line
}
```

Any project without an `image` renders the generated placeholder card instead,
so the site looks finished either way. 16:10 crops fit best (e.g. 1600×1000).
