const mock = {
  dir: "/",
  path: "/",
  links: [],
  children: [
    {
      dir: "a1",
      path: "/a1",
      links: [],
      children: [
        {
          dir: "a1b1",
          path: "/a1/b1",
          links: [],
          children: []
        }
     ]
    }, 
    {
      dir: "b1",
      path: "/b1",
      links: [],
      children: [
        {
          dir: "b1a1",
          path: "/b1/a1",
          links: [],
          children: [{
            dir: "b1a1a1",
            path: "/b1/a1/a1",
            links: [],
            children: []
          }]
        }, 
        {
          dir: "b1a2",
          path: "/b1/a2",
          links: [],
          children: []
        }
      ]
    }
  ]
}

export default mock