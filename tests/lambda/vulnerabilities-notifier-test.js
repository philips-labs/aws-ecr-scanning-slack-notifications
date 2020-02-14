const sinon = require("sinon");
const rewire = require("rewire");
const axios = require("axios");
const vulnerabilitiesNotifier = rewire(
  "../../src/lambda/vulnerabilities-notifier"
);

vulnerabilitiesNotifier.__set__("axios", axios);

describe("vulnerabilities-notifier", () => {
  it("should notify slack if it is a new image", async () => {
    const axiosStub = sinon.stub(axios, "post").callsFake(() => {
      return Promise.resolve({});
    });
    await vulnerabilitiesNotifier.notify([
      {
        eventName: "INSERT",
        dynamodb: {
          NewImage: {
            last_run: {
              S: "2019-11-13T11:03:40.013Z"
            },
            registry_id: {
              S: "759729069002"
            },
            repository: {
              S: "swat/multi-cloud/bone-age-assessment"
            },
            sha_digest: {
              S:
                "sha256:3d732c9573d586585469115e8a6d5e216eeea6ed834afde856f4a829ed34a606"
            },
            tag: {
              S: "0.1.0"
            },
            aws_vulnerabilities: {
              M: {
                INFORMATIONAL: {
                  N: "28"
                },
                LOW: {
                  N: "193"
                },
                MEDIUM: {
                  N: "19"
                }
              }
            }
          }
        }
      }
    ]);

    sinon.assert.calledWithExactly(axiosStub, process.env.SLACK_ENDPOINT, {
      text:
        '_Vulnerabilities Detected_ for *swat/multi-cloud/bone-age-assessment* with SHA *sha256:3d732c9573d586585469115e8a6d5e216eeea6ed834afde856f4a829ed34a606* tagged *0.1.0* \n ```{"INFORMATIONAL":28,"LOW":193,"MEDIUM":19}```'
    });

    axiosStub.restore();
  });

  it("should notify slack if there were changes to an existing image", async () => {
    const axiosStub = sinon.stub(axios, "post").callsFake(() => {
      return Promise.resolve({});
    });
    await vulnerabilitiesNotifier.notify([
      {
        eventName: "MODIFY",
        dynamodb: {
          NewImage: {
            last_run: {
              S: "2019-11-13T11:03:40.013Z"
            },
            registry_id: {
              S: "759729069002"
            },
            repository: {
              S: "swat/multi-cloud/bone-age-assessment"
            },
            sha_digest: {
              S:
                "sha256:3d732c9573d586585469115e8a6d5e216eeea6ed834afde856f4a829ed34a606"
            },
            tag: {
              S: "0.1.0"
            },
            aws_vulnerabilities: {
              M: {
                INFORMATIONAL: {
                  N: "28"
                },
                LOW: {
                  N: "193"
                },
                MEDIUM: {
                  N: "19"
                }
              }
            }
          },
          OldImage: {
            last_run: {
              S: "2019-11-13T11:03:40.013Z"
            },
            registry_id: {
              S: "759729069002"
            },
            repository: {
              S: "swat/multi-cloud/bone-age-assessment"
            },
            sha_digest: {
              S:
                "sha256:3d732c9573d586585469115e8a6d5e216eeea6ed834afde856f4a829ed34a606"
            },
            tag: {
              S: "0.1.0"
            },
            aws_vulnerabilities: {
              M: {
                INFORMATIONAL: {
                  N: "28"
                },
                LOW: {
                  N: "193"
                },
                MEDIUM: {
                  N: "25"
                }
              }
            }
          }
        }
      }
    ]);

    sinon.assert.calledWithExactly(axiosStub, process.env.SLACK_ENDPOINT, {
      text:
        '_Vulnerabilities Changed_ for *swat/multi-cloud/bone-age-assessment* with SHA *sha256:3d732c9573d586585469115e8a6d5e216eeea6ed834afde856f4a829ed34a606* tagged *0.1.0* \n ```{"INFORMATIONAL":28,"LOW":193,"MEDIUM":19}```'
    });

    axiosStub.restore();
  });

  it("should NOT notify slack if there were no changes", async () => {
    const axiosStub = sinon.stub(axios, "post").callsFake(() => {
      return Promise.resolve({});
    });
    await vulnerabilitiesNotifier.notify([
      {
        eventName: "MODIFY",
        dynamodb: {
          NewImage: {
            last_run: {
              S: "2019-11-13T11:03:40.013Z"
            },
            registry_id: {
              S: "759729069002"
            },
            repository: {
              S: "swat/multi-cloud/bone-age-assessment"
            },
            sha_digest: {
              S:
                "sha256:3d732c9573d586585469115e8a6d5e216eeea6ed834afde856f4a829ed34a606"
            },
            tag: {
              S: "0.1.0"
            },
            aws_vulnerabilities: {
              M: {
                INFORMATIONAL: {
                  N: "28"
                },
                LOW: {
                  N: "193"
                },
                MEDIUM: {
                  N: "19"
                }
              }
            }
          },
          OldImage: {
            last_run: {
              S: "2019-11-13T11:03:40.013Z"
            },
            registry_id: {
              S: "759729069002"
            },
            repository: {
              S: "swat/multi-cloud/bone-age-assessment"
            },
            sha_digest: {
              S:
                "sha256:3d732c9573d586585469115e8a6d5e216eeea6ed834afde856f4a829ed34a606"
            },
            tag: {
              S: "0.1.0"
            },
            aws_vulnerabilities: {
              M: {
                INFORMATIONAL: {
                  N: "28"
                },
                LOW: {
                  N: "193"
                },
                MEDIUM: {
                  N: "19"
                }
              }
            }
          }
        }
      }
    ]);

    sinon.assert.notCalled(axiosStub);
    axiosStub.restore();
  });
});
