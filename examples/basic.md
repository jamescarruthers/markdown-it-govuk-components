# GOV.UK Components Example

This document demonstrates all the available components.

## Typography

### Headings

# Extra large heading (H1)
## Large heading (H2)
### Medium heading (H3)
#### Small heading (H4)

### Body text

This is a paragraph with **bold text** and *italic text* and a [link to GOV.UK](https://www.gov.uk).

## Components

### Warning text

:::warning
You can be fined up to £5,000 if you do not register.
:::

### Inset text

:::inset
It can take up to 8 weeks to register a lasting power of attorney if there are no mistakes in the application.
:::

### Details

:::details
Help with nationality
---
We need to know your nationality so we can work out which elections you're entitled to vote in. If you cannot provide your nationality, you'll have to send copies of identity documents through the post.
:::

### Buttons

[!button Start now](#)
[!button:secondary Cancel](#)
[!button:warning Delete account](#)

### Tags

[!tag Alpha]
[!tag:green Completed]
[!tag:red Urgent]

### Phase banner

[!phase:beta]

## Forms

### Text input

[!input:text "Full name" name="full-name" hint="As shown on your passport"]

### Radio buttons

:::radio-group "Where do you live?" name="location"
[!radio "England" name="location" value="england"]
[!radio "Scotland" name="location" value="scotland"]
[!radio "Wales" name="location" value="wales"]
[!radio "Northern Ireland" name="location" value="northern-ireland"]
:::

### Checkboxes

:::checkbox-group "Which types of waste do you transport?" name="waste-types" hint="Select all that apply"
[!checkbox "Waste from homes" name="waste-types" value="home"]
[!checkbox "Waste from businesses" name="waste-types" value="business"]
[!checkbox "Waste from construction sites" name="waste-types" value="construction"]
:::

### Select

[!select "How many employees do you have?" name="employees" options="1 to 10,11 to 50,51 to 250,More than 250"]

## Lists

### Bullet list

- England
- Scotland
- Wales
- Northern Ireland

### Numbered list

1. Check you're eligible
2. Apply online
3. Pay the fee
4. Wait for a decision

## Tables

| Name | Role | Department |
|------|------|------------|
| John Smith | Developer | Digital |
| Jane Doe | Designer | Digital |
| Bob Johnson | Manager | Operations |

## Panels

:::panel confirmation
Application complete
Your reference number is HDJ2123F
:::

## Notification banners

:::notification
There may be a delay in processing your application
:::

:::notification success
Your details have been updated
:::

## Error summary

:::error
- Enter your full name
- Select your date of birth
- Enter a valid email address
:::

## Mermaid diagram

```mermaid
graph TD
    A[Start] --> B{Are you eligible?}
    B -->|Yes| C[Apply online]
    B -->|No| D[Check requirements]
    C --> E[Pay fee]
    E --> F[Submit]