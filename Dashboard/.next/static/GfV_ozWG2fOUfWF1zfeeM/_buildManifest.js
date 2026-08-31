self.__BUILD_MANIFEST = {
  "__rewrites": {
    "afterFiles": [
      {
        "source": "/auth/callback",
        "destination": "/api/auth/callback"
      },
      {
        "source": "/auth/login",
        "destination": "/api/auth/login"
      },
      {
        "source": "/auth/logout",
        "destination": "/api/auth/logout"
      }
    ],
    "beforeFiles": [],
    "fallback": []
  },
  "sortedPages": [
    "/_app",
    "/_error"
  ]
};self.__BUILD_MANIFEST_CB && self.__BUILD_MANIFEST_CB()