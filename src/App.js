import React, { Component } from'react'
import { 
    MDBContainer, MDBRow, MDBCol, MDBBtn,
    MDBModal, MDBModalHeader, MDBModalBody, MDBModalFooter,
    MDBInput,
    MDBCard, MDBCardBody, MDBCardTitle, MDBCardText
} from 'mdbreact'

import html2pdf from 'html2pdf.js'

import '@fortawesome/fontawesome-free/css/all.min.css'
import 'bootstrap-css-only/css/bootstrap.min.css'
import 'mdbreact/dist/css/mdb.css'

const IPFSClient = require('ipfs-http-client')
let ipfs = IPFSClient('localhost', '5002')

const CUSTOM_CSS_FIELDS = [
    'custom_css_name', 
    'custom_css_user_info', 
    'custom_css_section_title', 
    'custom_css_university_company', 
    'custom_css_course_position',
    'custom_css_date',
    'custom_css_description'
]


class App extends Component {
    state = {
        education: '',
        user_info_name: '',
        user_info_address: '',
        user_info_email: '',
        user_info_phone_number: '',
        user_info_education: [],
        user_info_experience: [],
        loading: false,
        education_modal: false,
        experience_modal: false,
        cv_history: [],
        custom_css: '',
        mode: 'user-info',

        custom_css_name: {},
        custom_css_user_info: {},
        custom_css_section_title: {},
        custom_css_university_company: {},
        custom_css_course_position: {},
        custom_css_date: {},
        custom_css_description: {},

        custom_css_name_temp: JSON.stringify({}),
        custom_css_user_info_temp: JSON.stringify({}),
        custom_css_section_title_temp: JSON.stringify({}),
        custom_css_university_company_temp: JSON.stringify({}),
        custom_css_course_position_temp: JSON.stringify({}),
        custom_css_date_temp: JSON.stringify({}),
        custom_css_description_temp: JSON.stringify({}),

        errors: []
    }

    componentWillMount = async () => {
        console.log('ipfs ready: ', ipfs)
        const { id } = await ipfs.id()
        console.log('id: ', id)
        const user = await this.getProfileJSON(id)
        await this.setUserState(user)
        
        await this.setState({
            ipfs, 
            id,
            user
        })
        
        console.log('mounted state: ', this.state)
    }

    getProfileJSON = async (id) => {
        try {
            const name = await ipfs.name.resolve(`/ipns/${id}`)
            console.log('name: ', name)
            const files = await ipfs.get(`${name}/json`)
            const user_metadata = String.fromCharCode.apply(null, files[0].content)
            return JSON.parse(user_metadata)
        } catch (err) {
            console.log('err: ', err)
            return false
        }
    }

    setUserState = async (user) => {
        await this.setState({ 
            user_info_name: user.user_info_name,
            user_info_email: user.user_info_email,
            user_info_address: user.user_info_address,
            user_info_phone_number: user.user_info_phone_number,
            user_info_education: user.user_info_education,
            user_info_experience: user.user_info_experience,

            custom_css_name: user.custom_css_name,
            custom_css_user_info: user.custom_css_user_info,
            custom_css_section_title: user.custom_css_section_title,
            custom_css_university_company: user.custom_css_university_company,
            custom_css_course_position: user.custom_css_course_position,
            custom_css_date: user.custom_css_date,
            custom_css_description: user.custom_css_description,

            custom_css_name_temp: JSON.stringify(user.custom_css_name),
            custom_css_user_info_temp: JSON.stringify(user.custom_css_user_info),
            custom_css_section_title_temp: JSON.stringify(user.custom_css_section_title),
            custom_css_university_company_temp: JSON.stringify(user.custom_css_university_company),
            custom_css_course_position_temp: JSON.stringify(user.custom_css_course_position),
            custom_css_date_temp: JSON.stringify(user.custom_css_date),
            custom_css_description_temp: JSON.stringify(user.custom_css_description),
        })
    }
        // console.log('getting user with public_hex: ', public_hex)
        // console.log('res: ', res)
        // try {
        //     if (res[0]._id) {
        //         
        //     }
        // } catch (err) {
        //     await this.setState({ 
        //         user_info_name: '',
        //         user_info_email: '',
        //         user_info_address: '',
        //         user_info_phone_number: '',
        //         user_info_education: [],
        //         user_info_experience: [],

        //         custom_css_name: {},
        //         custom_css_user_info: {},
        //         custom_css_section_title: {},
        //         custom_css_university_company: {},
        //         custom_css_course_position: {},
        //         custom_css_date:  {},
        //         custom_css_description: {},

        //         custom_css_name_temp: JSON.stringify({}),
        //         custom_css_user_info_temp: JSON.stringify({}),
        //         custom_css_section_title_temp: JSON.stringify({}),
        //         custom_css_university_company_temp: JSON.stringify({}),
        //         custom_css_course_position_temp: JSON.stringify({}),
        //         custom_css_date_temp: JSON.stringify({}),
        //         custom_css_description_temp: JSON.stringify({}),

        //         // cv_history: res[0].data.cv_history
        //     })
        //     console.log('err: ', err)
        // }
    // }

    handleOnChange = (e) => {
        this.setState({ [e.target.id]: e.target.value })
    }

    handleAddEducation = async () => {
        const { school, degree, course, education_start_date, education_end_date } = this.state 

        const education_data = {
            school,
            degree,
            course,
            education_start_date,
            education_end_date
        }
        console.log(education_data)
        this.setState(prevState => ({
            user_info_education: [...prevState.user_info_education, education_data]
        }))
        this.setState({ education_modal: !this.state.education_modal })
        console.log(this.state.user_info_education)
    }

    handleAddExperience = async () => {
        const { company, position, experience_start_date, experience_end_date, job_description } = this.state 
        const experience_data = {
            company, 
            position, 
            experience_start_date, 
            experience_end_date, 
            job_description
        }
        this.setState(prevState => ({
            user_info_experience: [...prevState.user_info_experience, experience_data]
        }))
        this.setState({ experience_modal: !this.state.experience_modal })
        console.log(this.state.user_info_experience)
    }

    addFileToIPFS = async () => {
        const { ipfs } = this.state 

        const cv = document.getElementById('cv-preview')
        const pdf_output = await html2pdf().from(cv).outputPdf()
        const cv_buffer = Buffer.from(pdf_output, 'binary')
        const uploaded_file = await ipfs.add(cv_buffer)
        console.log('uploaded_file: ', uploaded_file)
        await this.setState(prevState => ({
            cv_history: [...prevState.cv_history, uploaded_file[0]]
        }))
    }

    uploadJSONToIPNS = async (data) => {
        const { ipfs } = this.state 
        const options = {
            wrapWithDirectory: true,
            onlyHash: false,
            pin: true
          }
          // Create binary buffer from JSON string
        const buf = Buffer.from(JSON.stringify(data))
        const res = await ipfs.add({
            path: 'json',
            content: buf
        }, options)
        console.log('res: ', res)
        const pub = await ipfs.name.publish(res[1].hash)
        console.log('pub: ', pub)
        console.log(`published '${pub.value}' to profile: ${pub.name}`)
        console.log('resolving: ', pub.name)
        const _idk = await ipfs.name.resolve(`/ipns/${pub.name}`)
        console.log('_idk: ', _idk)
    }

    downloadFile = () => {
        const cv = document.getElementById('cv-preview')
        let today = new Date()
        let dd = today.getDate()
        let mm = today.getMonth() + 1
        let yyyy = today.getFullYear()

        if (dd < 10) 
            dd = '0' + dd

        if (mm < 10) 
            mm = '0' + mm

        today = `${mm}-${dd}-${yyyy}`
        const filename = `${this.state.user_info_name}_${today}`

        html2pdf(cv, { filename })
    }

    handleUploadCVToIPFS = async () => {        
        await this.addFileToIPFS()
        
        const { 
            user_info_name, 
            user_info_email, 
            user_info_address, 
            user_info_phone_number, 
            user_info_education, 
            user_info_experience, 

            custom_css_name,
            custom_css_user_info,
            custom_css_section_title,
            
            custom_css_university_company,
            custom_css_course_position,
            custom_css_date,
            custom_css_description,
    
            cv_history 
        } = this.state
        
        const data = { 
            user_info_name, 
            user_info_email, 
            user_info_address, 
            user_info_phone_number, 
            user_info_education, 
            user_info_experience, 

            custom_css_name,
            custom_css_user_info,
            custom_css_section_title,
            
            custom_css_university_company,
            custom_css_course_position,
            custom_css_date,
            custom_css_description,
            
            cv_history 
        }

        this.uploadJSONToIPNS(data)
        this.downloadFile()
    }
    
    deleteEducation = (exp_id) => {
        const { user_info_education } = this.state 
        console.log(this.state.user_info_education)
        const index = user_info_education.findIndex(exp => exp._id === exp_id)
        this.setState(prevState => ({
            user_info_education: [...prevState.user_info_education.slice(0,index), ...prevState.user_info_education.slice(index+1)]
        }))
    }

    deleteExperience = (exp_id) => {
        const { user_info_experience } = this.state 
        console.log(this.state.user_info_experience)
        const index = user_info_experience.findIndex(exp => exp._id === exp_id)
        this.setState(prevState => ({
            user_info_experience: [...prevState.user_info_experience.slice(0,index), ...prevState.user_info_experience.slice(index+1)]
        }))
    }

    handleCustomCSSChange = (e) => {
        let key = `${e.target.id}_temp`
        this.setState({ [key]: e.target.value })
    }

    applyCSSChanges = async () => {
        for (const field of CUSTOM_CSS_FIELDS) {
            try {
                const new_css = JSON.parse(this.state[`${field}_temp`])
                console.log(`new_css for ${field}`, new_css, typeof new_css)
                this.setState({ [field]: new_css })
            } catch (err) {
                let errors = this.state.errors.slice()
                let error_field = field.slice(11, field.length)
                error_field = error_field.replace(/_/g, '/')
                errors.push(error_field)
                errors = [...new Set(errors)]
                
                await this.setState({ errors })
            }
        }
    }
    
    render() {
        const { id } = this.state

        return (
            <MDBContainer>
                <br/>
                <br/>
                <h2 className="h2 mb-4 text-center">Decentralized CVs</h2>
                <MDBRow>
                    <MDBCol>
                        <p>Please save your <strong>hex code</strong> to access your information:</p>
                        <MDBInput value={id} onChange={(e) => this.onHexcodeChange(e.target.value)}/>
                    </MDBCol>
                </MDBRow>
                
                <MDBRow>
                    <MDBCol size="8">
                        <MDBBtn className="float-left" color="blue" onClick={() => this.setState({ mode: 'user-info'}) }>User Info</MDBBtn>
                        <MDBBtn className="float-left" color="blue" onClick={() => this.setState({ mode: 'education'}) }>Education</MDBBtn>
                        <MDBBtn className="float-left" color="blue" onClick={() => this.setState({ mode: 'experience'}) }>Experience</MDBBtn>
                        <MDBBtn className="float-left" color="blue" onClick={() => this.setState({ mode: 'custom-css'}) }>Custom CSS</MDBBtn>
                    </MDBCol>
                    <MDBCol size="4">
                        <MDBBtn className="float-right" color="green" onClick={this.handleUploadCVToIPFS}>Save Changes</MDBBtn>
                    </MDBCol>
                </MDBRow>
                <br />
                <br />
                <MDBRow>
                    {this.state.mode === 'education' ?
                        <MDBCol>
                            <MDBBtn className="float-right" color="primary" onClick={() => this.setState({ education_modal: !this.state.education_modal })}>Add Education</MDBBtn>
                            <br/>
                            <br/>
                            <br/>
                            <div>
                                {this.state.user_info_education.map((e) => {
                                    return (
                                        <MDBCard className="w-100 mb-4">
                                            <MDBCardBody>
                                                <MDBCardTitle>{e.school}<MDBBtn className="float-right" color="danger" size="sm" onClick={() => this.deleteEducation(e._id)}>x</MDBBtn></MDBCardTitle>
                                                <MDBCardText>
                                                    {e.degree} - {e.course}
                                                    <br/>
                                                    {e.education_start_date} - {e.education_end_date}
                                                </MDBCardText>
                                            </MDBCardBody>
                                        </MDBCard>
                                    )
                                })}
                            </div>
                        </MDBCol>
                        :
                        <div></div>
                    }
                    {this.state.mode === 'experience' ?
                        <MDBCol>
                                <MDBBtn className="float-right" color="primary" onClick={() => this.setState({ experience_modal: !this.state.experience_modal })}>Add Experience</MDBBtn>
                                <br/>
                                <br/>
                                <br/>
                                <div>
                                    {this.state.user_info_experience.map((e) => {
                                        return (
                                            <MDBCard className="w-100 mb-4">
                                                <MDBCardBody>
                                                    <MDBCardTitle>{e.company}<MDBBtn className="float-right" color="danger" size="sm" onClick={() => this.deleteExperience(e._id)}>x</MDBBtn></MDBCardTitle>
                                                    <MDBCardText>
                                                        {e.position}
                                                        <br/>
                                                        {e.experience_start_date} - {e.experience_end_date}
                                                        <br/>
                                                        {e.job_description}
                                                    </MDBCardText>
                                                </MDBCardBody>
                                            </MDBCard>
                                        )
                                    })}
                                </div>

                        </MDBCol>
                        :
                        <div></div>
                    }
                    {this.state.mode === 'user-info' ?
                        <MDBCol>
                            <MDBRow>
                                <MDBCol>
                                    <MDBInput
                                        label="Name"
                                        icon="user"
                                        group
                                        type="text"
                                        validate
                                        error="wrong"
                                        success="right"
                                        id='user_info_name'
                                        onChange={this.handleOnChange}
                                        value={this.state.user_info_name ? this.state.user_info_name : ''}
                                    />
                                    <MDBInput
                                        label="Email"
                                        icon="envelope"
                                        group
                                        type="email"
                                        validate
                                        error="wrong"
                                        success="right"
                                        id='user_info_email'
                                        onChange={this.handleOnChange}
                                        value={this.state.user_info_email ? this.state.user_info_email : ''}
                                    />
                                    <MDBInput
                                        label="Address"
                                        icon="home"
                                        group
                                        type="text"
                                        validate
                                        error="wrong"
                                        success="right"
                                        id='user_info_address'
                                        onChange={this.handleOnChange}
                                        value={this.state.user_info_address}
                                    />
                                    <MDBInput
                                        label="Phone Number"
                                        icon="phone"
                                        group
                                        type="text"
                                        validate
                                        error="wrong"
                                        success="right"
                                        id='user_info_phone_number'
                                        onChange={this.handleOnChange}
                                        value={this.state.user_info_phone_number}
                                    />
                                </MDBCol>
                            </MDBRow>
                        </MDBCol>
                        :
                        <div></div>
                    }
                    {this.state.mode === 'custom-css' ?
                        <MDBCol>
                            <MDBInput
                                type="textarea"
                                rows="2"
                                label="Name"
                                id='custom_css_name'
                                value={this.state.custom_css_name_temp}
                                onChange={this.handleCustomCSSChange}
                            />
                            <MDBInput
                                type="textarea"
                                rows="2"
                                label="User Info"
                                id='custom_css_user_info'
                                value={this.state.custom_css_user_info_temp}
                                onChange={this.handleCustomCSSChange}
                            />
                            <MDBInput
                                type="textarea"
                                rows="2"
                                label="Section Titles"
                                id='custom_css_section_title'
                                value={this.state.custom_css_section_title_temp}
                                onChange={this.handleCustomCSSChange}
                            />
                            <MDBInput
                                type="textarea"
                                rows="2"
                                label="University and Company Line"
                                id='custom_css_university_company'
                                value={this.state.custom_css_university_company_temp}
                                onChange={this.handleCustomCSSChange}
                            />
                            <MDBInput
                                type="textarea"
                                rows="2"
                                label="Program / Course and Position Line"
                                id='custom_css_course_position'
                                value={this.state.custom_css_course_position_temp}
                                onChange={this.handleCustomCSSChange}
                            />
                            <MDBInput
                                type="textarea"
                                rows="2"
                                label="Duration Line"
                                id='custom_css_date'
                                value={this.state.custom_css_date_temp}
                                onChange={this.handleCustomCSSChange}
                            />
                            <MDBInput
                                type="textarea"
                                rows="2"
                                label="Description"
                                id='custom_css_description'
                                value={this.state.custom_css_description_temp}
                                onChange={this.handleCustomCSSChange}
                            />
                            { this.state.errors.length > 0 ? 
                                <p className="float-left" id='fields-error-message'>You have errors in the following fields: {this.state.errors.join(', ')}</p> 
                                : 
                                '' 
                            }
                            <MDBBtn className="float-right" color="blue" onClick={this.applyCSSChanges}>Apply Changes</MDBBtn>
                        </MDBCol>
                        :
                        <div></div>
                    }
                    <MDBCol>
                        <h1 class="h4 mb-4">PDF Preview</h1>
                        <div id='cv-preview'>
                            <MDBContainer>
                                <MDBCard>
                                    <MDBCardBody>
                                        <p style={this.state.custom_css_name}>{this.state.user_info_name}</p>
                                        <div style={this.state.custom_css_user_info}>
                                            <p>{this.state.user_info_address} {this.state.user_info_email} {this.state.user_info_phone_number} </p>
                                        </div>
                                        <p style={this.state.custom_css_section_title}>Education</p>
                                        {this.state.user_info_education.map((e) => {
                                            return (
                                                <div id='education-container'>
                                                    <p id='education-school-name' style={this.state.custom_css_university_company}>{e.school}</p>
                                                    <p id='education-degree-course' style={this.state.custom_css_course_position}>{e.degree} - {e.course}</p>
                                                    <p id='education-dates' style={this.state.custom_css_date}>{e.education_start_date} - {e.education_end_date}</p>
                                                    <br />
                                                </div>
                                            )
                                        })}
                                        <p id='section-title' style={this.state.custom_css_section_title}>Experience</p>
                                        {this.state.user_info_experience.map((e) => {
                                            return (
                                                <div id='experience-container'>
                                                    <p id='experience-company' style={this.state.custom_css_university_company}>{e.company}</p>
                                                    <p id='experience-position' style={this.state.custom_css_course_position}>{e.position}</p>
                                                    <p id='experience-dates' style={this.state.custom_css_date}>{e.experience_start_date} - {e.experience_end_date}</p>
                                                    <p id='experience-description' style={this.state.custom_css_description}>{e.job_description}</p>
                                                    <br />
                                                </div>
                                            )
                                        })}
                                    </MDBCardBody>
                                </MDBCard>
                            </MDBContainer>
                        </div>
                        <br/><br/>
                    </MDBCol>
                </MDBRow>

                <MDBModal isOpen={this.state.education_modal} toggle={() => this.setState({ education_modal: !this.state.education_modal })} centered>
                    <MDBModalHeader toggle={() => this.setState({ education_modal: !this.state.education_modal })}>Add Education</MDBModalHeader>
                    <MDBModalBody>
                        <MDBContainer>
                            <form>
                                <div className="grey-text">
                                    <MDBInput
                                        label="School"
                                        group
                                        type="text"
                                        validate
                                        error="wrong"
                                        success="right"
                                        id='school'
                                        onChange={this.handleOnChange}
                                    />
                                    <MDBInput
                                        label="Degree"
                                        group
                                        type="text"
                                        validate
                                        error="wrong"
                                        success="right"
                                        id='degree'
                                        onChange={this.handleOnChange}
                                    />
                                    <MDBInput
                                        label="Course"
                                        group
                                        type="text"
                                        validate
                                        error="wrong"
                                        success="right"
                                        id='course'
                                        onChange={this.handleOnChange}
                                    />
                                    <MDBInput
                                        label="Start Year-Month"
                                        group
                                        type="text"
                                        validate
                                        error="wrong"
                                        success="right"
                                        id='education_start_date'
                                        onChange={this.handleOnChange}
                                    />
                                    <MDBInput
                                        label="Graduation Year-Month"
                                        group
                                        type="text"
                                        validate
                                        error="wrong"
                                        success="right"
                                        id='education_end_date'
                                        onChange={this.handleOnChange}
                                    />
                                </div>
                            </form>
                        </MDBContainer>
                    </MDBModalBody>
                    <MDBModalFooter>
                        <MDBBtn color="secondary" onClick={() => this.setState({ education_modal: !this.state.education_modal })}>Close</MDBBtn>
                        <MDBBtn color="primary" onClick={this.handleAddEducation}>Add</MDBBtn>
                    </MDBModalFooter>
                </MDBModal>
                <MDBModal isOpen={this.state.experience_modal} toggle={() => this.setState({ experience_modal: !this.state.experience_modal })} centered>
                    <MDBModalHeader toggle={() => this.setState({ experience_modal: !this.state.experience_modal })}>Add Experience</MDBModalHeader>
                    <MDBModalBody>
                        <MDBContainer>
                            <form>
                                <div className="grey-text">
                                    <MDBInput
                                        label="Company"
                                        group
                                        type="text"
                                        validate
                                        error="wrong"
                                        success="right"
                                        id='company'
                                        onChange={this.handleOnChange}
                                    />
                                    <MDBInput
                                        label="Position"
                                        group
                                        type="email"
                                        validate
                                        error="wrong"
                                        success="right"
                                        id='position'
                                        onChange={this.handleOnChange}
                                    />
                                    <MDBInput
                                        label="Start Month and Year"
                                        group
                                        type="text"
                                        validate
                                        error="wrong"
                                        success="right"
                                        id='experience_start_date'
                                        onChange={this.handleOnChange}
                                    />
                                    <MDBInput
                                        label="End Month and Year"
                                        group
                                        type="text"
                                        validate
                                        error="wrong"
                                        success="right"
                                        id='experience_end_date'
                                        onChange={this.handleOnChange}
                                    />
                                    <MDBInput
                                        type="textarea"
                                        rows="3"
                                        label="Job Description"
                                        id='job_description'
                                        onChange={this.handleOnChange}
                                    />
                                </div>
                            </form>
                        </MDBContainer>
                    </MDBModalBody>
                    <MDBModalFooter>
                        <MDBBtn color="secondary" onClick={() => this.setState({ experience_modal: !this.state.experience_modal })}>Close</MDBBtn>
                        <MDBBtn color="primary" onClick={this.handleAddExperience}>Add</MDBBtn>
                    </MDBModalFooter>
                </MDBModal>
            </MDBContainer>
        )
    }
}

export default App 
