const { t } = require('../services/i18n')

const footer = (lang) => {
  return `
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
                                          font-family: Arial, Helvetica Neue,
                                            Helvetica, sans-serif;
                                          font-size: 12px;
                                          font-weight: 400;
                                          line-height: 1.5;
                                          text-align: left;
                                          mso-line-height-alt: 18px;
                                        "
                                      >
                                        <p style="margin: 0">
                                          ${t('footer.bloc1', lang)}
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
                                        ${t('footer.bloc2_before', lang)}
                                          <a
                                            href="https://step-ify.vercel.app/privacy-policy"
                                            target="_self"
                                            title="${t(
                                              'footer.bloc2_link',
                                              lang,
                                            )}"
                                            style="
                                              text-decoration: underline;
                                              color: #00a2ff;
                                            "
                                            >${t('footer.bloc2_link', lang)}</a
                                          >
                                          ${t('footer.bloc2_after', lang)}
                                        </p>
                                        <p style="margin: 0">&nbsp;</p>
                                        <p style="margin: 0">
                                        ${t('footer.bloc3', lang)}
                                        </p>
                                        <p style="margin: 0">
                                          ${t('footer.bloc4_before', lang)}
                                          <a
                                            href="https://step-ify.vercel.app/settings"
                                            target="_self"
                                            style="
                                              text-decoration: underline;
                                              color: #00a2ff;
                                            "
                                            >${t('footer.bloc4_link', lang)}</a
                                          >
                                          ${t('footer.bloc4_after', lang)}
                                        </p>
                                      </div>
                                    </td>
                                  </tr>
                                </table>`
}

module.exports = { footer }
