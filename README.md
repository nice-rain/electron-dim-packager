# Electron Dim Packager

This is an electron application for creating DIM packages for Daz Studio.

![Electron DIM Packager Screenshot](https://i.imgur.com/Gt8xSX4.png)

# Features

- Creates `Manifest.dsx` and `Supplement.dsx` files to allow DIM to install and uninstall packages.
- Prints output to a built-in console
- Allows for easy creation using a zip file (only if the .zip file contains library contents)
- Packages all content back up in output directory

## Getting Started

1. `npm install` to install dependencies
2. In the electron-dim-packager repository, add directory for `input` and `ouput`
3. In the `input` directory, add a `Content` directory.
4. `npm run dev` to launch the electron development environment

### Zip File

Note: If you are using a .zip file, the directory structure must be flat and exactly how it would be installed to your library (directory needs to contain directories such as `data`, `people`, etc.)

- Check the box for `Use Zip` and select your .zip file.
- Fill out other information such as `Product ID` and `Product Name`
- Click submit
- When finished, package will be in the `output` folder

### No Zip File

- If you can't use a .zip file (such as when the .zip file starts with a `My Content` directory), you'll need to add all contents to the `input/Content` directory.
- Once all files have been added to the `input/Content` directory, click the submit button to generate a new package
- Package will be in the `output` folder

## Tips

- Packages need to be dropped into DIM's download directory, then refreshed.
- Unchecking `Delete Package Once Installed` will allow DIM to keep an archive of packages (to make it easier to uninstall when you aren't using content)

## Future Work / Extensions

- Automatically generate `input\Content` and `output` directories when application loads for first time
- Automatically scroll console down as it populates
- Links to open `input` and `output` directories for easy access
- Allow adding of images for smart content support
