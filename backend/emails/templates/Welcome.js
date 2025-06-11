const { t } = require('../services/i18n')

const WelcomeEmailTemplate = () => {
  const template = `
  <!DOCTYPE html>
<html
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  lang="en"
>
  <head>
    <title></title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!--[if mso]>
      <xml
        ><w:WordDocument xmlns:w="urn:schemas-microsoft-com:office:word"
          ><w:DontUseAdvancedTypographyReadingMail
        /></w:WordDocument>
        <o:OfficeDocumentSettings
          ><o:PixelsPerInch>96</o:PixelsPerInch
          ><o:AllowPNG /></o:OfficeDocumentSettings
      ></xml>
    <![endif]-->
    <!--[if !mso]><!-->
    <link
      href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900"
      rel="stylesheet"
      type="text/css"
    />
    <!--<![endif]-->
    <style>
      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 0;
      }

      a[x-apple-data-detectors] {
        color: inherit !important;
        text-decoration: inherit !important;
      }

      #MessageViewBody a {
        color: inherit;
        text-decoration: none;
      }

      p {
        line-height: inherit;
      }

      .desktop_hide,
      .desktop_hide table {
        mso-hide: all;
        display: none;
        max-height: 0px;
        overflow: hidden;
      }

      .image_block img + div {
        display: none;
      }

      sup,
      sub {
        font-size: 75%;
        line-height: 0;
      }

      @media (max-width: 660px) {
        .desktop_hide table.icons-inner,
        .social_block.desktop_hide .social-table {
          display: inline-block !important;
        }

        .icons-inner {
          text-align: center;
        }

        .icons-inner td {
          margin: 0 auto;
        }

        .image_block div.fullWidth {
          max-width: 100% !important;
        }

        .mobile_hide {
          display: none;
        }

        .row-content {
          width: 100% !important;
        }

        .stack .column {
          width: 100%;
          display: block;
        }

        .mobile_hide {
          min-height: 0;
          max-height: 0;
          max-width: 0;
          overflow: hidden;
          font-size: 0px;
        }

        .desktop_hide,
        .desktop_hide table {
          display: table !important;
          max-height: none !important;
        }

        .row-4 .column-1 .block-4.paragraph_block td.pad > div {
          font-size: 25px !important;
        }

        .row-4 .column-1 .block-5.paragraph_block td.pad > div {
          font-size: 14px !important;
        }
      }
    </style>
    <!--[if mso
      ]><style>
        sup,
        sub {
          font-size: 100% !important;
        }
        sup {
          mso-text-raise: 10%;
        }
        sub {
          mso-text-raise: -10%;
        }
      </style>
    <![endif]-->
  </head>

  <body
    class="body"
    style="
      background-color: #f8f8f9;
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: none;
      text-size-adjust: none;
    "
  >
    <table
      class="nl-container"
      width="100%"
      border="0"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      style="
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
        background-color: #f8f8f9;
      "
    >
      <tbody>
        <tr>
          <td>
            <table
              class="row row-1"
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
                background-color: #007a90;
              "
            >
              <tbody>
                <tr>
                  <td>
                    <table
                      class="row-content stack"
                      align="center"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="
                        mso-table-lspace: 0pt;
                        mso-table-rspace: 0pt;
                        border-radius: 0;
                        color: #000000;
                        width: 640px;
                        margin: 0 auto;
                      "
                      width="640"
                    >
                      <tbody>
                        <tr>
                          <td
                            class="column column-1"
                            width="100%"
                            style="
                              mso-table-lspace: 0pt;
                              mso-table-rspace: 0pt;
                              font-weight: 400;
                              text-align: left;
                              padding-bottom: 5px;
                              padding-top: 5px;
                              vertical-align: top;
                            "
                          >
                            <div
                              class="spacer_block block-1"
                              style="
                                height: 21px;
                                line-height: 21px;
                                font-size: 1px;
                              "
                            >
                              &#8202;
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              class="row row-2"
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
                background-color: #007a90;
              "
            >
              <tbody>
                <tr>
                  <td>
                    <table
                      class="row-content stack"
                      align="center"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="
                        mso-table-lspace: 0pt;
                        mso-table-rspace: 0pt;
                        color: #000000;
                        width: 640px;
                        margin: 0 auto;
                      "
                      width="640"
                    >
                      <tbody>
                        <tr>
                          <td
                            class="column column-1"
                            width="33.333333333333336%"
                            style="
                              mso-table-lspace: 0pt;
                              mso-table-rspace: 0pt;
                              font-weight: 400;
                              text-align: left;
                              padding-bottom: 5px;
                              padding-top: 5px;
                              vertical-align: top;
                            "
                          >
                            <div
                              class="spacer_block block-1"
                              style="
                                height: 0px;
                                line-height: 0px;
                                font-size: 1px;
                              "
                            >
                              &#8202;
                            </div>
                          </td>
                          <td
                            class="column column-2"
                            width="33.333333333333336%"
                            style="
                              mso-table-lspace: 0pt;
                              mso-table-rspace: 0pt;
                              font-weight: 400;
                              text-align: left;
                              padding-bottom: 5px;
                              padding-top: 5px;
                              vertical-align: top;
                            "
                          >
                            <table
                              class="image_block block-1"
                              width="100%"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                              "
                            >
                              <tr>
                                <td
                                  class="pad"
                                  style="
                                    width: 100%;
                                    padding-right: 0px;
                                    padding-left: 0px;
                                  "
                                >
                                  <div class="alignment" align="center">
                                    <div style="max-width: 96px">
                                      <img
                                        src="https://res.cloudinary.com/dpqhhckyj/image/upload/v1748293668/icon_d8irxb.png"
                                        style="
                                          display: block;
                                          height: auto;
                                          border: 0;
                                          width: 100%;
                                        "
                                        width="96"
                                        alt="Stepify Logo"
                                        title="Stepify Logo"
                                        height="auto"
                                      />
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </table>
                          </td>
                          <td
                            class="column column-3"
                            width="33.333333333333336%"
                            style="
                              mso-table-lspace: 0pt;
                              mso-table-rspace: 0pt;
                              font-weight: 400;
                              text-align: left;
                              padding-bottom: 5px;
                              padding-top: 5px;
                              vertical-align: top;
                            "
                          >
                            <div
                              class="spacer_block block-1"
                              style="
                                height: 0px;
                                line-height: 0px;
                                font-size: 1px;
                              "
                            >
                              &#8202;
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              class="row row-3"
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
                background-color: #007a90;
              "
            >
              <tbody>
                <tr>
                  <td>
                    <table
                      class="row-content stack"
                      align="center"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="
                        mso-table-lspace: 0pt;
                        mso-table-rspace: 0pt;
                        border-radius: 0;
                        color: #000000;
                        width: 640px;
                        margin: 0 auto;
                      "
                      width="640"
                    >
                      <tbody>
                        <tr>
                          <td
                            class="column column-1"
                            width="100%"
                            style="
                              mso-table-lspace: 0pt;
                              mso-table-rspace: 0pt;
                              font-weight: 400;
                              text-align: left;
                              padding-bottom: 5px;
                              padding-top: 5px;
                              vertical-align: top;
                            "
                          >
                            <div
                              class="spacer_block block-1"
                              style="
                                height: 21px;
                                line-height: 21px;
                                font-size: 1px;
                              "
                            >
                              &#8202;
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              class="row row-4"
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
                background-color: #007a90;
              "
            >
              <tbody>
                <tr>
                  <td>
                    <table
                      class="row-content stack"
                      align="center"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="
                        mso-table-lspace: 0pt;
                        mso-table-rspace: 0pt;
                        background-color: #fff;
                        color: #000000;
                        border-radius: 20px 20px 0 0;
                        width: 640px;
                        margin: 0 auto;
                      "
                      width="640"
                    >
                      <tbody>
                        <tr>
                          <td
                            class="column column-1"
                            width="100%"
                            style="
                              mso-table-lspace: 0pt;
                              mso-table-rspace: 0pt;
                              font-weight: 400;
                              text-align: left;
                              vertical-align: top;
                            "
                          >
                            <table
                              class="divider_block block-1"
                              width="100%"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                              "
                            >
                              <tr>
                                <td
                                  class="pad"
                                  style="
                                    padding-bottom: 12px;
                                    padding-top: 60px;
                                  "
                                >
                                  <div class="alignment" align="center">
                                    <table
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      role="presentation"
                                      width="100%"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                      "
                                    >
                                      <tr>
                                        <td
                                          class="divider_inner"
                                          style="
                                            font-size: 1px;
                                            line-height: 1px;
                                            border-top: 0px solid #bbbbbb;
                                          "
                                        >
                                          <span style="word-break: break-word"
                                            >&#8202;</span
                                          >
                                        </td>
                                      </tr>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            </table>
                            <table
                              class="image_block block-2"
                              width="100%"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                              "
                            >
                              <tr>
                                <td
                                  class="pad"
                                  style="
                                    padding-left: 40px;
                                    padding-right: 40px;
                                    width: 100%;
                                  "
                                >
                                  <div class="alignment" align="center">
                                    <div
                                      class="fullWidth"
                                      style="max-width: 352px"
                                    >
                                      <img
                                        src="https://res.cloudinary.com/dpqhhckyj/image/upload/v1748293667/email_xui7j8.jpg"
                                        style="
                                          display: block;
                                          height: auto;
                                          border: 0;
                                          width: 100%;
                                        "
                                        width="352"
                                        alt="email image"
                                        title="email image"
                                        height="auto"
                                      />
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </table>
                            <table
                              class="divider_block block-3"
                              width="100%"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                              "
                            >
                              <tr>
                                <td class="pad" style="padding-top: 50px">
                                  <div class="alignment" align="center">
                                    <table
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      role="presentation"
                                      width="100%"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                      "
                                    >
                                      <tr>
                                        <td
                                          class="divider_inner"
                                          style="
                                            font-size: 1px;
                                            line-height: 1px;
                                            border-top: 0px solid #bbbbbb;
                                          "
                                        >
                                          <span style="word-break: break-word"
                                            >&#8202;</span
                                          >
                                        </td>
                                      </tr>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            </table>
                            <table
                              class="paragraph_block block-4"
                              width="100%"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                                word-break: break-word;
                              "
                            >
                              <tr>
                                <td
                                  class="pad"
                                  style="
                                    padding-bottom: 10px;
                                    padding-left: 40px;
                                    padding-right: 40px;
                                    padding-top: 10px;
                                  "
                                >
                                  <div
                                    style="
                                      color: #555555;
                                      font-family: Montserrat, Trebuchet MS,
                                        Lucida Grande, Lucida Sans Unicode,
                                        Lucida Sans, Tahoma, sans-serif;
                                      font-size: 30px;
                                      line-height: 1.2;
                                      text-align: center;
                                      mso-line-height-alt: 36px;
                                    "
                                  >
                                    <p
                                      style="margin: 0; word-break: break-word"
                                    >
                                      <span
                                        style="
                                          word-break: break-word;
                                          color: #2b303a;
                                        "
                                        ><strong
                                          >Vérifie ton adresse mail</strong
                                        ></span
                                      >
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            </table>
                            <table
                              class="paragraph_block block-5"
                              width="100%"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                                word-break: break-word;
                              "
                            >
                              <tr>
                                <td
                                  class="pad"
                                  style="
                                    padding-bottom: 10px;
                                    padding-left: 40px;
                                    padding-right: 40px;
                                    padding-top: 10px;
                                  "
                                >
                                  <div
                                    style="
                                      color: #555555;
                                      font-family: Montserrat, Trebuchet MS,
                                        Lucida Grande, Lucida Sans Unicode,
                                        Lucida Sans, Tahoma, sans-serif;
                                      font-size: 15px;
                                      line-height: 1.5;
                                      text-align: center;
                                      mso-line-height-alt: 23px;
                                    "
                                  >
                                    <p
                                      style="margin: 0; word-break: break-word"
                                    >
                                      Veuillez cliquer sur le bouton ci-dessous
                                      pour confirmer votre adresse électronique
                                      et terminer la création de votre compte.
                                      Ce code est valable pendant 24 heures.
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            </table>
                            <table
                              class="html_block block-6"
                              width="100%"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                              "
                            >
                              <tr>
                                <td class="pad">
                                  <div
                                    style="
                                      font-family: Montserrat, Trebuchet MS,
                                        Lucida Grande, Lucida Sans Unicode,
                                        Lucida Sans, Tahoma, sans-serif;
                                      text-align: center;
                                    "
                                    align="center"
                                  >
                                    <div class="our-class">
                                      <span></span>
                                      <span></span>
                                      <span></span>
                                      <span></span>
                                      <span></span>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              class="row row-5"
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
                background-color: #007a90;
              "
            >
              <tbody>
                <tr>
                  <td>
                    <table
                      class="row-content stack"
                      align="center"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="
                        mso-table-lspace: 0pt;
                        mso-table-rspace: 0pt;
                        background-color: #fff;
                        color: #000000;
                        border-radius: 0 0 20px 20px;
                        width: 640px;
                        margin: 0 auto;
                      "
                      width="640"
                    >
                      <tbody>
                        <tr>
                          <td
                            class="column column-1"
                            width="100%"
                            style="
                              mso-table-lspace: 0pt;
                              mso-table-rspace: 0pt;
                              font-weight: 400;
                              text-align: left;
                              padding-bottom: 5px;
                              padding-top: 5px;
                              vertical-align: top;
                            "
                          >
                            <table
                              class="divider_block block-1"
                              width="100%"
                              border="0"
                              cellpadding="20"
                              cellspacing="0"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                              "
                            >
                              <tr>
                                <td class="pad">
                                  <div class="alignment" align="center">
                                    <table
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      role="presentation"
                                      width="100%"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                      "
                                    >
                                      <tr>
                                        <td
                                          class="divider_inner"
                                          style="
                                            font-size: 1px;
                                            line-height: 1px;
                                            border-top: 0px solid #bbbbbb;
                                          "
                                        >
                                          <span style="word-break: break-word"
                                            >&#8202;</span
                                          >
                                        </td>
                                      </tr>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            </table>
                            <table
                              class="html_block block-2"
                              width="100%"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                              "
                            >
                              <tr>
                                <td class="pad">
                                  <div
                                    style="
                                      font-family: Montserrat, Trebuchet MS,
                                        Lucida Grande, Lucida Sans Unicode,
                                        Lucida Sans, Tahoma, sans-serif;
                                      text-align: center;
                                    "
                                    align="center"
                                  >
                                    <div
                                      style="
                                        font-family: Montserrat, Trebuchet MS,
                                          Lucida Grande, Lucida Sans Unicode,
                                          Lucida Sans, Tahoma, sans-serif;
                                        text-align: center;
                                      "
                                    >
                                      <div
                                        style="
                                          background: #f4f4f4;
                                          padding: 20px;
                                          margin: 20px auto;
                                          max-width: 400px;
                                          border-radius: 12px;
                                        "
                                      >
                                        <h3
                                          style="color: #2b303a; margin-top: 0"
                                        >
                                          Votre code de vérification
                                        </h3>
                                        <div
                                          style="
                                            font-size: calc(12px + 1.2vh);
                                            letter-spacing: 3px;
                                            font-weight: bold;
                                            color: #1aa19c;
                                            margin: 15px 0;
                                          "
                                        >
                                          {verificationCode}
                                        </div>
                                        <p
                                          style="
                                            color: #555;
                                            font-size: 14px;
                                            margin-bottom: 0;
                                          "
                                        >
                                          Ce code expire dans 24 heures
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </table>
                            <table
                              class="divider_block block-3"
                              width="100%"
                              border="0"
                              cellpadding="20"
                              cellspacing="0"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                              "
                            >
                              <tr>
                                <td class="pad">
                                  <div class="alignment" align="center">
                                    <table
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      role="presentation"
                                      width="100%"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                      "
                                    >
                                      <tr>
                                        <td
                                          class="divider_inner"
                                          style="
                                            font-size: 1px;
                                            line-height: 1px;
                                            border-top: 0px solid #bbbbbb;
                                          "
                                        >
                                          <span style="word-break: break-word"
                                            >&#8202;</span
                                          >
                                        </td>
                                      </tr>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              class="row row-6"
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
                background-color: #007a90;
                background-size: auto;
              "
            >
              <tbody>
                <tr>
                  <td>
                    <table
                      class="row-content stack"
                      align="center"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="
                        mso-table-lspace: 0pt;
                        mso-table-rspace: 0pt;
                        color: #000000;
                        background-color: #007a90;
                        background-size: auto;
                        width: 640px;
                        margin: 0 auto;
                      "
                      width="640"
                    >
                      <tbody>
                        <tr>
                          <td
                            class="column column-1"
                            width="100%"
                            style="
                              mso-table-lspace: 0pt;
                              mso-table-rspace: 0pt;
                              font-weight: 400;
                              text-align: left;
                              vertical-align: top;
                            "
                          >
                            <table
                              class="divider_block block-1"
                              width="100%"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                              "
                            >
                              <tr>
                                <td class="pad">
                                  <div class="alignment" align="center">
                                    <table
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      role="presentation"
                                      width="100%"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                      "
                                    >
                                      <tr>
                                        <td
                                          class="divider_inner"
                                          style="
                                            font-size: 1px;
                                            line-height: 1px;
                                            border-top: 4px solid #1aa19c;
                                          "
                                        >
                                          <span style="word-break: break-word"
                                            >&#8202;</span
                                          >
                                        </td>
                                      </tr>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            </table>
                            <table
                              class="image_block block-2"
                              width="100%"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                              "
                            >
                              <tr>
                                <td class="pad" style="width: 100%">
                                  <div class="alignment" align="center">
                                    <div style="max-width: 640px">
                                      <img
                                        src="https://res.cloudinary.com/dpqhhckyj/image/upload/v1748293668/logo_bxchod.png"
                                        style="
                                          display: block;
                                          height: auto;
                                          border: 0;
                                          width: 100%;
                                        "
                                        width="640"
                                        alt="stepify logo and slogan"
                                        title="stepify logo and slogan"
                                        height="auto"
                                      />
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </table>
                            <table
                              class="social_block block-3"
                              width="100%"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                              "
                            >
                              <tr>
                                <td
                                  class="pad"
                                  style="
                                    padding-bottom: 10px;
                                    padding-left: 10px;
                                    padding-right: 10px;
                                    padding-top: 28px;
                                    text-align: center;
                                  "
                                >
                                  <div class="alignment" align="center">
                                    <table
                                      class="social-table"
                                      width="208px"
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      role="presentation"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                        display: inline-block;
                                      "
                                    >
                                      <tr>
                                        <td style="padding: 0 10px 0 10px">
                                          <a
                                            href="https://www.facebook.com"
                                            target="_blank"
                                            ><img
                                              src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-outline-circle-white/facebook@2x.png"
                                              width="32"
                                              height="auto"
                                              alt="Facebook"
                                              title="Facebook"
                                              style="
                                                display: block;
                                                height: auto;
                                                border: 0;
                                              "
                                          /></a>
                                        </td>
                                        <td style="padding: 0 10px 0 10px">
                                          <a
                                            href="https://www.twitter.com"
                                            target="_blank"
                                            ><img
                                              src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-outline-circle-white/twitter@2x.png"
                                              width="32"
                                              height="auto"
                                              alt="Twitter"
                                              title="Twitter"
                                              style="
                                                display: block;
                                                height: auto;
                                                border: 0;
                                              "
                                          /></a>
                                        </td>
                                        <td style="padding: 0 10px 0 10px">
                                          <a
                                            href="https://www.instagram.com"
                                            target="_blank"
                                            ><img
                                              src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-outline-circle-white/instagram@2x.png"
                                              width="32"
                                              height="auto"
                                              alt="Instagram"
                                              title="Instagram"
                                              style="
                                                display: block;
                                                height: auto;
                                                border: 0;
                                              "
                                          /></a>
                                        </td>
                                        <td style="padding: 0 10px 0 10px">
                                          <a
                                            href="https://www.linkedin.com"
                                            target="_blank"
                                            ><img
                                              src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-outline-circle-white/linkedin@2x.png"
                                              width="32"
                                              height="auto"
                                              alt="LinkedIn"
                                              title="LinkedIn"
                                              style="
                                                display: block;
                                                height: auto;
                                                border: 0;
                                              "
                                          /></a>
                                        </td>
                                      </tr>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            </table>
                            <table
                              class="paragraph_block block-4"
                              width="100%"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                                word-break: break-word;
                              "
                            >
                              <tr>
                                <td
                                  class="pad"
                                  style="
                                    padding-bottom: 10px;
                                    padding-left: 40px;
                                    padding-right: 40px;
                                    padding-top: 15px;
                                  "
                                >
                                  <div
                                    style="
                                      color: #c7c7c7;
                                      font-family: Montserrat, Trebuchet MS,
                                        Lucida Grande, Lucida Sans Unicode,
                                        Lucida Sans, Tahoma, sans-serif;
                                      font-size: 12px;
                                      font-weight: 400;
                                      line-height: 1.5;
                                      text-align: left;
                                      mso-line-height-alt: 18px;
                                    "
                                  >
                                    <p style="margin: 0">
                                      Vous recevez cet email car vous avez créé
                                      un compte sur Stepify. Si vous pensez
                                      avoir reçu cet email par erreur, vous
                                      pouvez ignorer ce message ou nous
                                      contacter à
                                      <a
                                        href="mailto:stepify.contact@gmail.com?subject=À propos de Stepify"
                                        target="_blank"
                                        title="stepify.contact@gmail.com"
                                        style="
                                          text-decoration: underline;
                                          color: #00a2ff;
                                        "
                                        rel="noopener"
                                        >stepify.contact@gmail.com</a
                                      >.
                                    </p>
                                    <p style="margin: 0">
                                      Stepify s’engage à protéger vos données
                                      personnelles. Vous pouvez consulter notre
                                      <a
                                        href="https://step-ify.vercel.app/privacy-policy"
                                        target="_self"
                                        title="politique de confidentialité"
                                        style="
                                          text-decoration: underline;
                                          color: #00a2ff;
                                        "
                                        >politique de confidentialité</a
                                      >
                                      pour en savoir plus sur la manière dont
                                      vos informations sont utilisées et
                                      stockées.
                                    </p>
                                    <p style="margin: 0">&nbsp;</p>
                                    <p style="margin: 0">
                                      Cet email est envoyé automatiquement,
                                      merci de ne pas y répondre directement.
                                    </p>
                                    <p style="margin: 0">
                                      Si vous ne souhaitez plus recevoir
                                      d’emails de notre part ou préférez
                                      modifier la fréquence de nos
                                      communications, vous pouvez
                                      <a
                                        href="https://step-ify.vercel.app/settings"
                                        target="_self"
                                        style="
                                          text-decoration: underline;
                                          color: #00a2ff;
                                        "
                                        >gérer vos préférences de
                                        notification</a
                                      >
                                      à tout moment depuis votre compte.
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            </table>
                            <div
                              class="spacer_block block-5"
                              style="
                                height: 36px;
                                line-height: 36px;
                                font-size: 1px;
                              "
                            >
                              &#8202;
                            </div>
                            <table
                              class="paragraph_block block-6"
                              width="100%"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              style="
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                                word-break: break-word;
                              "
                            >
                              <tr>
                                <td
                                  class="pad"
                                  style="
                                    padding-bottom: 30px;
                                    padding-left: 40px;
                                    padding-right: 40px;
                                    padding-top: 20px;
                                  "
                                >
                                  <div
                                    style="
                                      color: #c7c7c7;
                                      font-family: Montserrat, Trebuchet MS,
                                        Lucida Grande, Lucida Sans Unicode,
                                        Lucida Sans, Tahoma, sans-serif;
                                      font-size: 12px;
                                      font-weight: 700;
                                      line-height: 1.2;
                                      text-align: left;
                                      mso-line-height-alt: 14px;
                                    "
                                  >
                                    <p style="margin: 0">
                                      Stepify – Step into action, electrify
                                    </p>
                                    <p style="margin: 0">
                                      Stepify Copyright © 2025
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    <!-- End -->
  </body>
</html>
`
  return template
}

module.exports = {
  WelcomeEmailTemplate,
}
