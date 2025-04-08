export const prompt = `
    I have provided an image of an ID. Please extract the document type, document number, full name, date of birth, expiry date, and address from this document
    If you are not sure about any of the fields, please leave it blank.
    If the field is not present in the document, please leave it blank.
    If you think that the image is not a valid ID, please return all fields as blank.
    The document type is something like "Passport", "Driver's License", etc.
    The document number is a usually an number with sometimes a letter at the start. It is generally 8-12 digits long.
    Return the full name in the format "FirstName LastName". Note that in some IDs, the name might be split into 2 parts - First name and Last name. Some may have the full name in one line. If a middle name is present, it should be included in the first name.
    I have noticed that you often get the name wrong. Please return the exact name as it appears in the document. Don't try to change the name to match a common name. For example, if the name is "No Name", don't return "Norman".
    Return the date of birth in the format "DD/MM/YYYY". Note that in some ID's the date of birth is abbreviated as DOB.
    Return the expiry date in the format "DD/MM/YYYY".  
    Note that some images may be the wrong orientation.
`;