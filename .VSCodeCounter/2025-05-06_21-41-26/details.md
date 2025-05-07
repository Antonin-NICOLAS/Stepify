# Details

Date : 2025-05-06 21:41:26

Directory /Users/antoninnicolas/Desktop/2024-2029/Stepify

Total : 76 files,  19936 codes, 318 comments, 1436 blanks, all 21690 lines

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [README.md](/README.md) | Markdown | 11 | 0 | 2 | 13 |
| [backend/api/index.js](/backend/api/index.js) | JavaScript | 44 | 7 | 9 | 60 |
| [backend/config/cloudinary.js](/backend/config/cloudinary.js) | JavaScript | 8 | 0 | 2 | 10 |
| [backend/controllers/AccountController.js](/backend/controllers/AccountController.js) | JavaScript | 325 | 10 | 64 | 399 |
| [backend/controllers/AuthController.js](/backend/controllers/AuthController.js) | JavaScript | 555 | 23 | 90 | 668 |
| [backend/controllers/StepController.js](/backend/controllers/StepController.js) | JavaScript | 164 | 10 | 40 | 214 |
| [backend/middlewares/VerifyAuthorization.js](/backend/middlewares/VerifyAuthorization.js) | JavaScript | 7 | 0 | 1 | 8 |
| [backend/middlewares/VerifyToken.js](/backend/middlewares/VerifyToken.js) | JavaScript | 19 | 0 | 3 | 22 |
| [backend/middlewares/multer.js](/backend/middlewares/multer.js) | JavaScript | 4 | 0 | 2 | 6 |
| [backend/models/Challenge.js](/backend/models/Challenge.js) | JavaScript | 22 | 0 | 5 | 27 |
| [backend/models/Reward.js](/backend/models/Reward.js) | JavaScript | 19 | 0 | 0 | 19 |
| [backend/models/StepEntry.js](/backend/models/StepEntry.js) | JavaScript | 33 | 0 | 5 | 38 |
| [backend/models/User.js](/backend/models/User.js) | JavaScript | 271 | 10 | 12 | 293 |
| [backend/package-lock.json](/backend/package-lock.json) | JSON | 1,843 | 0 | 1 | 1,844 |
| [backend/package.json](/backend/package.json) | JSON | 36 | 0 | 1 | 37 |
| [backend/routes/AccountRoutes.js](/backend/routes/AccountRoutes.js) | JavaScript | 34 | 5 | 5 | 44 |
| [backend/routes/AuthRoutes.js](/backend/routes/AuthRoutes.js) | JavaScript | 33 | 5 | 7 | 45 |
| [backend/routes/StepRoutes.js](/backend/routes/StepRoutes.js) | JavaScript | 24 | 5 | 4 | 33 |
| [backend/utils/EmailTemplates.js](/backend/utils/EmailTemplates.js) | JavaScript | 1,614 | 0 | 82 | 1,696 |
| [backend/utils/GenerateAuthCookie.js](/backend/utils/GenerateAuthCookie.js) | JavaScript | 25 | 0 | 5 | 30 |
| [backend/utils/GenerateCode.js](/backend/utils/GenerateCode.js) | JavaScript | 4 | 0 | 1 | 5 |
| [backend/utils/ParseHealthData.js](/backend/utils/ParseHealthData.js) | JavaScript | 143 | 7 | 30 | 180 |
| [backend/utils/SendMail.js](/backend/utils/SendMail.js) | JavaScript | 107 | 1 | 10 | 118 |
| [backend/utils/StatsUtils.js](/backend/utils/StatsUtils.js) | JavaScript | 60 | 0 | 16 | 76 |
| [backend/vercel.json](/backend/vercel.json) | JSON | 9 | 0 | 0 | 9 |
| [frontend/README.md](/frontend/README.md) | Markdown | 7 | 0 | 6 | 13 |
| [frontend/eslint.config.js](/frontend/eslint.config.js) | JavaScript | 32 | 0 | 2 | 34 |
| [frontend/index.html](/frontend/index.html) | HTML | 31 | 6 | 5 | 42 |
| [frontend/package-lock.json](/frontend/package-lock.json) | JSON | 6,644 | 0 | 1 | 6,645 |
| [frontend/package.json](/frontend/package.json) | JSON | 49 | 0 | 1 | 50 |
| [frontend/public/vite.svg](/frontend/public/vite.svg) | XML | 1 | 0 | 0 | 1 |
| [frontend/src/App.css](/frontend/src/App.css) | CSS | 35 | 2 | 4 | 41 |
| [frontend/src/App.jsx](/frontend/src/App.jsx) | JavaScript JSX | 38 | 0 | 4 | 42 |
| [frontend/src/components/Header.css](/frontend/src/components/Header.css) | CSS | 267 | 14 | 42 | 323 |
| [frontend/src/components/Header.jsx](/frontend/src/components/Header.jsx) | JavaScript JSX | 101 | 4 | 11 | 116 |
| [frontend/src/components/Loader.jsx](/frontend/src/components/Loader.jsx) | JavaScript JSX | 318 | 5 | 7 | 330 |
| [frontend/src/components/NotFound.css](/frontend/src/components/NotFound.css) | CSS | 359 | 1 | 60 | 420 |
| [frontend/src/components/NotFound.jsx](/frontend/src/components/NotFound.jsx) | JavaScript JSX | 76 | 0 | 11 | 87 |
| [frontend/src/context/AuthContext.jsx](/frontend/src/context/AuthContext.jsx) | JavaScript JSX | 314 | 10 | 28 | 352 |
| [frontend/src/context/ThemeContext.jsx](/frontend/src/context/ThemeContext.jsx) | JavaScript JSX | 46 | 4 | 12 | 62 |
| [frontend/src/context/UserContext.jsx](/frontend/src/context/UserContext.jsx) | JavaScript JSX | 249 | 10 | 30 | 289 |
| [frontend/src/hooks/useSteps.js](/frontend/src/hooks/useSteps.js) | JavaScript | 137 | 0 | 16 | 153 |
| [frontend/src/hooks/useStepsFilters.js](/frontend/src/hooks/useStepsFilters.js) | JavaScript | 45 | 3 | 10 | 58 |
| [frontend/src/hooks/useStepsStats.js](/frontend/src/hooks/useStepsStats.js) | JavaScript | 37 | 1 | 6 | 44 |
| [frontend/src/index.css](/frontend/src/index.css) | CSS | 85 | 11 | 13 | 109 |
| [frontend/src/layouts/MainLayout.jsx](/frontend/src/layouts/MainLayout.jsx) | JavaScript JSX | 14 | 0 | 2 | 16 |
| [frontend/src/main.jsx](/frontend/src/main.jsx) | JavaScript JSX | 8 | 0 | 2 | 10 |
| [frontend/src/pages/About.jsx](/frontend/src/pages/About.jsx) | JavaScript JSX | 9 | 0 | 2 | 11 |
| [frontend/src/pages/Auth/ChangeEmail.jsx](/frontend/src/pages/Auth/ChangeEmail.jsx) | JavaScript JSX | 48 | 3 | 8 | 59 |
| [frontend/src/pages/Auth/EmailSent.css](/frontend/src/pages/Auth/EmailSent.css) | CSS | 125 | 3 | 20 | 148 |
| [frontend/src/pages/Auth/EmailSent.jsx](/frontend/src/pages/Auth/EmailSent.jsx) | JavaScript JSX | 40 | 2 | 7 | 49 |
| [frontend/src/pages/Auth/EmailVerification.css](/frontend/src/pages/Auth/EmailVerification.css) | CSS | 232 | 8 | 34 | 274 |
| [frontend/src/pages/Auth/EmailVerification.jsx](/frontend/src/pages/Auth/EmailVerification.jsx) | JavaScript JSX | 174 | 18 | 28 | 220 |
| [frontend/src/pages/Auth/Forgot-pwd.css](/frontend/src/pages/Auth/Forgot-pwd.css) | CSS | 89 | 5 | 12 | 106 |
| [frontend/src/pages/Auth/Forgot-pwd.jsx](/frontend/src/pages/Auth/Forgot-pwd.jsx) | JavaScript JSX | 45 | 3 | 7 | 55 |
| [frontend/src/pages/Auth/Login.css](/frontend/src/pages/Auth/Login.css) | CSS | 239 | 5 | 36 | 280 |
| [frontend/src/pages/Auth/Login.jsx](/frontend/src/pages/Auth/Login.jsx) | JavaScript JSX | 159 | 3 | 16 | 178 |
| [frontend/src/pages/Auth/Reset-pwd.css](/frontend/src/pages/Auth/Reset-pwd.css) | CSS | 123 | 6 | 20 | 149 |
| [frontend/src/pages/Auth/Reset-pwd.jsx](/frontend/src/pages/Auth/Reset-pwd.jsx) | JavaScript JSX | 99 | 3 | 14 | 116 |
| [frontend/src/pages/Challenges.jsx](/frontend/src/pages/Challenges.jsx) | JavaScript JSX | 9 | 0 | 2 | 11 |
| [frontend/src/pages/Dashboard.css](/frontend/src/pages/Dashboard.css) | CSS | 886 | 6 | 165 | 1,057 |
| [frontend/src/pages/Dashboard.jsx](/frontend/src/pages/Dashboard.jsx) | JavaScript JSX | 714 | 18 | 36 | 768 |
| [frontend/src/pages/Home.jsx](/frontend/src/pages/Home.jsx) | JavaScript JSX | 9 | 0 | 4 | 13 |
| [frontend/src/pages/Leaderboard.jsx](/frontend/src/pages/Leaderboard.jsx) | JavaScript JSX | 9 | 0 | 2 | 11 |
| [frontend/src/pages/Rewards.jsx](/frontend/src/pages/Rewards.jsx) | JavaScript JSX | 9 | 0 | 2 | 11 |
| [frontend/src/pages/Settings.css](/frontend/src/pages/Settings.css) | CSS | 582 | 5 | 105 | 692 |
| [frontend/src/pages/Settings.jsx](/frontend/src/pages/Settings.jsx) | JavaScript JSX | 553 | 20 | 31 | 604 |
| [frontend/src/pages/Steps.css](/frontend/src/pages/Steps.css) | CSS | 601 | 11 | 110 | 722 |
| [frontend/src/pages/Steps.jsx](/frontend/src/pages/Steps.jsx) | JavaScript JSX | 730 | 35 | 87 | 852 |
| [frontend/src/routes/AppRoutes.jsx](/frontend/src/routes/AppRoutes.jsx) | JavaScript JSX | 49 | 9 | 4 | 62 |
| [frontend/src/routes/RoutesGuards.jsx](/frontend/src/routes/RoutesGuards.jsx) | JavaScript JSX | 30 | 0 | 8 | 38 |
| [frontend/src/utils/GlobalLoader.jsx](/frontend/src/utils/GlobalLoader.jsx) | JavaScript JSX | 8 | 0 | 1 | 9 |
| [frontend/vercel.json](/frontend/vercel.json) | JSON | 12 | 0 | 0 | 12 |
| [frontend/vite.config.js](/frontend/vite.config.js) | JavaScript | 12 | 1 | 3 | 16 |
| [package-lock.json](/package-lock.json) | JSON | 13 | 0 | 1 | 14 |
| [package.json](/package.json) | JSON | 21 | 0 | 1 | 22 |

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)