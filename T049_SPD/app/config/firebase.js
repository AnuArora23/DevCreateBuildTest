import admin from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.cert({
    type: "service_account",
    project_id: "gemini-tutor-l09qb",
    private_key_id: "9a84638957e1e0debd88f75565a8c0de1d2fb71a",
    private_key:
      "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCxBLqnhMDz/pNB\n9wPEp0nqumB7/8fV//Q7z4qg23Y27ggr6G8uQ+1Ex0SFUcTlbdTFyPO7B3ODSA65\nW4x6+9SnthfCDyM2ACDXt2gKe93I06AsaYCH2JLapUXzjc2MGDZIQcIwYnAzdc5B\n8xbrCDA+N4wyzKmxfTZSRq7fgAecGomdDij+Hi7T4i7caMsCBdkJlCMHKkgcQs9W\ntG+6lWKVn5L30kGGls4/d7PY5lSm8acWiO4DbHZ4X9nrTfwgyfC4f8z7fyWrtH6K\nAzz94o8Dm9i/MpiT6tnOh4EDl5TZj9etPpVn8RvvfF5P6JV9oclws9Jr3GuVANUR\nxg++bFInAgMBAAECggEAFl0flmcKLYkzDM6/63SrElGbkO7eo1BOiHk5mAWXPhdS\ncaGlh4sjYGDAbQtzPFJk4tv2wYvjxxPacFvQOAAK0hQKP6/D5grxcJoGNeoyOdtV\nTWcYIDwh9CeUhSbxb0qRHmMtvQkisw2mEjo7jKlLLFZo4EjFA4cVzs0z7fPx14G4\n+WI4OuBzuLzWiG0aP+QKyRTJqbAPo55EPawPxyFc9lNV51DrnUp2YQWQP81JrADA\nxRW1zXfWIdSh4vcNALKqYOggQA6VJ5mqzesjlA1tDOum9i+QS/1OdjrSBfnOErpU\nbi1lD4nuDU9E9NRQ8vmcq5eNj1V7IxBANnjfkBXG+QKBgQDat0GfJmiMfBOiaKSy\njF/C/c/MNZe+spmXE2Nn/QPjsfJxHOvW2iFP3AqRJxdSEfhbSPllEimwzsmj/4xf\nc0eFQ3IGBG58k9o7YtbfLjvti5mBqLJlMiBATLC5ttHyJLg68GUNKvp0CAj3CEqA\nWdGrJs2D5HN1CohtHHaxepgOIwKBgQDPMc1vzkS1luU8IwQ7WMrOs5FhzQPlkmpT\nB874c0FJ4gyKo/OxhgDlyZ2jpZwiLBqH54ncDsy8O2s95nNQxM/mlIDqR4WUbFmI\nlEnjn4fCjUUjsezd0m6E04oHiRcYe0Ik85+KidwRWfxjNKfZfOeOQDRp/7mwST/6\n/13LysUyLQKBgFfcXDEpxcABrAWHEfpj56g2O76mHNJPfuGwuTMx8dkLSABmhNsn\nf1BMbbZHxNeEPoe1NfKDLFpJh7ko1GQXtDh1kp2WNCg5YOaQWw8GzK4tcToj4Z5D\nV69c33WLWqVyWMvcfEug40GvZKKQIxWSf2bIzLBaGoN++rUSRSAgxmqPAoGBALy9\nrVrQF58jmiax70Twma65vRHOZGJYgiqozk1dEHhxRuN0fqWUYHTyuHs+fYBTlMeA\nkAC6Kp69se9tYlaNMqXlWZoRFQojuVvFWZnU1SLQ9c6SYiefbbXpza8XnsZaYeKv\nWwIkmyfjRRpJ+S0Rrw3SRuzYWxrPX00SGyttxzzxAoGAJmW3xCBcfmUpE4xUIEiU\njhhR8AqdVQu5AqOjF3RXy20642GPfgysZbv7/bqAzu6+pAGyql1vYmqmq0idlrDZ\nY9wZpxx1F2DbSPJEU+3EvrW3OcHVLAKHaEWdWMJ+lAL0432Awl0DOze/oSd4cmB5\nH2kPpeMNo6zMcdTYqUMsIq0=\n-----END PRIVATE KEY-----\n",
    client_email:
      "firebase-adminsdk-fbsvc@gemini-tutor-l09qb.iam.gserviceaccount.com",
    client_id: "117188994508556913762",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40gemini-tutor-l09qb.iam.gserviceaccount.com",
    universe_domain: "googleapis.com",
  }),
});

export const fcm = admin.messaging();
