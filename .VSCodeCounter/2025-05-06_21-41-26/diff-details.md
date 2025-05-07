# Diff Details

Date : 2025-05-06 21:41:26

Directory /Users/antoninnicolas/Desktop/2024-2029/Stepify

Total : 44 files,  5393 codes, 87 comments, 386 blanks, all 5866 lines

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details

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
| [frontend/src/App.css](/frontend/src/App.css) | CSS | 4 | 0 | 0 | 4 |
| [frontend/src/App.jsx](/frontend/src/App.jsx) | JavaScript JSX | -3 | 0 | 0 | -3 |
| [frontend/src/context/AuthContext.jsx](/frontend/src/context/AuthContext.jsx) | JavaScript JSX | 0 | 0 | -1 | -1 |
| [frontend/src/context/LoadingContext.jsx](/frontend/src/context/LoadingContext.jsx) | JavaScript JSX | -33 | 0 | -7 | -40 |
| [frontend/src/context/ThemeContext.jsx](/frontend/src/context/ThemeContext.jsx) | JavaScript JSX | 11 | 4 | 4 | 19 |
| [frontend/src/context/UserContext.jsx](/frontend/src/context/UserContext.jsx) | JavaScript JSX | 2 | 0 | -4 | -2 |
| [frontend/src/layouts/LoaderLayout.jsx](/frontend/src/layouts/LoaderLayout.jsx) | JavaScript JSX | -14 | 0 | -2 | -16 |
| [frontend/src/pages/Auth/ChangeEmail.jsx](/frontend/src/pages/Auth/ChangeEmail.jsx) | JavaScript JSX | -2 | 0 | 0 | -2 |
| [frontend/src/pages/Auth/EmailVerification.jsx](/frontend/src/pages/Auth/EmailVerification.jsx) | JavaScript JSX | -2 | 0 | 0 | -2 |
| [frontend/src/pages/Auth/Forgot-pwd.jsx](/frontend/src/pages/Auth/Forgot-pwd.jsx) | JavaScript JSX | -2 | 0 | 0 | -2 |
| [frontend/src/pages/Auth/Login.jsx](/frontend/src/pages/Auth/Login.jsx) | JavaScript JSX | -2 | 0 | 0 | -2 |
| [frontend/src/pages/Auth/Reset-pwd.jsx](/frontend/src/pages/Auth/Reset-pwd.jsx) | JavaScript JSX | -2 | 0 | 0 | -2 |
| [frontend/src/pages/Dashboard.jsx](/frontend/src/pages/Dashboard.jsx) | JavaScript JSX | -2 | 0 | 0 | -2 |
| [frontend/src/pages/Steps.jsx](/frontend/src/pages/Steps.jsx) | JavaScript JSX | 1 | 0 | -1 | 0 |
| [frontend/src/routes/AppRoutes.jsx](/frontend/src/routes/AppRoutes.jsx) | JavaScript JSX | -3 | 0 | 0 | -3 |
| [frontend/src/routes/RoutesGuards.jsx](/frontend/src/routes/RoutesGuards.jsx) | JavaScript JSX | -5 | 0 | 0 | -5 |
| [frontend/src/utils/GlobalLoader.jsx](/frontend/src/utils/GlobalLoader.jsx) | JavaScript JSX | -3 | 0 | -2 | -5 |
| [package-lock.json](/package-lock.json) | JSON | 13 | 0 | 1 | 14 |
| [package.json](/package.json) | JSON | 21 | 0 | 1 | 22 |

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details